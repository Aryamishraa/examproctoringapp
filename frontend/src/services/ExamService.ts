import { studentMonitoringService } from './StudentMonitoringService';

export interface ExamAnswer {
  questionId: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  isSkipped: boolean;
  timeSpent: number; // in seconds
  category: string;
}

export interface ExamProgress {
  studentId: string;
  examStartTime: Date;
  examEndTime: Date | null;
  totalQuestions: number;
  questionsAttempted: number;
  questionsSkipped: number;
  questionsAnswered: number;
  timeSpent: number; // total time in seconds
  answers: ExamAnswer[];
  categories: string[];
}

class ExamService {
  private examProgress: Map<string, ExamProgress> = new Map();
  private examStartTimes: Map<string, number> = new Map();

  public startExam(studentId: string): ExamProgress {
    const examProgress: ExamProgress = {
      studentId,
      examStartTime: new Date(),
      examEndTime: null,
      totalQuestions: 70, // Total questions from questions.ts
      questionsAttempted: 0,
      questionsSkipped: 0,
      questionsAnswered: 0,
      timeSpent: 0,
      answers: [],
      categories: [
        'Data Structures',
        'Algorithms', 
        'OOP',
        'DBMS',
        'Operating Systems',
        'Computer Networks',
        'Software Engineering',
        'Programming Languages',
        'Computer Architecture',
        'Discrete Mathematics',
        'Theory of Computation',
        'Web Technologies'
      ]
    };

    // Initialize all questions as unanswered
    for (let i = 1; i <= 70; i++) {
      examProgress.answers.push({
        questionId: i,
        selectedAnswer: null,
        isAnswered: false,
        isSkipped: false,
        timeSpent: 0,
        category: this.getCategoryForQuestion(i)
      });
    }

    this.examProgress.set(studentId, examProgress);
    this.examStartTimes.set(studentId, Date.now());
    
    return examProgress;
  }

  public answerQuestion(studentId: string, questionId: number, answer: string): void {
    const progress = this.examProgress.get(studentId);
    if (!progress) return;

    const questionIndex = questionId - 1; // Questions are 1-indexed
    if (questionIndex >= 0 && questionIndex < progress.answers.length) {
      const question = progress.answers[questionIndex];
      
      // Update answer
      question.selectedAnswer = answer;
      question.isAnswered = true;
      question.isSkipped = false;
      
      // Update time spent on this question
      const now = Date.now();
      const startTime = this.examStartTimes.get(studentId) || now;
      question.timeSpent = Math.floor((now - startTime) / 1000);
      
      // Update progress counts
      this.updateProgressCounts(progress);
      
      // Record activity in monitoring service
      studentMonitoringService.recordQuestionActivity(
        studentId, 
        'question_answer', 
        questionId, 
        `Answered question ${questionId} in ${question.category}`
      );
    }
  }

  public skipQuestion(studentId: string, questionId: number): void {
    const progress = this.examProgress.get(studentId);
    if (!progress) return;

    const questionIndex = questionId - 1;
    if (questionIndex >= 0 && questionIndex < progress.answers.length) {
      const question = progress.answers[questionIndex];
      
      question.selectedAnswer = null;
      question.isAnswered = false;
      question.isSkipped = true;
      
      // Update time spent on this question
      const now = Date.now();
      const startTime = this.examStartTimes.get(studentId) || now;
      question.timeSpent = Math.floor((now - startTime) / 1000);
      
      // Update progress counts
      this.updateProgressCounts(progress);
      
      // Record activity in monitoring service
      studentMonitoringService.recordQuestionActivity(
        studentId, 
        'question_skip', 
        questionId, 
        `Skipped question ${questionId} in ${question.category}`
      );
    }
  }

  public submitExam(studentId: string): ExamProgress | null {
    const progress = this.examProgress.get(studentId);
    if (!progress) return null;

    progress.examEndTime = new Date();
    progress.timeSpent = Math.floor((progress.examEndTime.getTime() - progress.examStartTime.getTime()) / 1000);
    
    // Final update of progress counts
    this.updateProgressCounts(progress);
    
    // Calculate score (simple percentage of answered questions)
    const score = progress.questionsAnswered > 0 
      ? Math.round((progress.questionsAnswered / progress.totalQuestions) * 100)
      : 0;
    
    // Get category breakdown
    const categoryBreakdown = this.getCategoryBreakdown(studentId);
    
    // Record exam completion in monitoring service
    studentMonitoringService.recordExamCompletion(studentId, {
      examId: `exam_${Date.now()}`,
      duration: progress.timeSpent,
      totalQuestions: progress.totalQuestions,
      questionsAttempted: progress.questionsAttempted,
      questionsAnswered: progress.questionsAnswered,
      questionsSkipped: progress.questionsSkipped,
      score: score,
      categories: categoryBreakdown
    });
    
    return progress;
  }

  public getExamProgress(studentId: string): ExamProgress | null {
    return this.examProgress.get(studentId);
  }

  public async saveProgress(studentId: string, progressData: {
    currentQuestion: number;
    answers: { [key: number]: string };
    questionStatuses: { [key: number]: string };
    timeRemaining: number;
    examStartTime: number;
  }): Promise<void> {
    const progress = this.examProgress.get(studentId);
    if (!progress) return;

    // Update answers based on the current progress data
    Object.entries(progressData.answers).forEach(([questionIndex, answer]) => {
      const questionId = parseInt(questionIndex) + 1; // Convert 0-indexed to 1-indexed
      if (questionId >= 1 && questionId <= 70) {
        const question = progress.answers[questionId - 1];
        if (question) {
          question.selectedAnswer = answer;
          question.isAnswered = true;
          question.isSkipped = false;
        }
      }
    });

    // Update question statuses
    Object.entries(progressData.questionStatuses).forEach(([questionIndex, status]) => {
      const questionId = parseInt(questionIndex) + 1;
      if (questionId >= 1 && questionId <= 70) {
        const question = progress.answers[questionId - 1];
        if (question) {
          if (status === 'skipped') {
            question.isSkipped = true;
            question.isAnswered = false;
            question.selectedAnswer = null;
          }
        }
      }
    });

    // Update progress counts
    this.updateProgressCounts(progress);

    // Record save activity in monitoring service
    studentMonitoringService.recordQuestionActivity(
      studentId,
      'progress_save',
      progressData.currentQuestion,
      `Progress saved at question ${progressData.currentQuestion}`
    );

    // Simulate async operation (in real implementation, this would save to database)
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  public getCategoryBreakdown(studentId: string): { category: string; attempted: number; answered: number; skipped: number; score: number }[] {
    const progress = this.examProgress.get(studentId);
    if (!progress) return [];

    const categoryMap = new Map<string, { attempted: number; answered: number; skipped: number; score: number }>();
    
    // Initialize all categories
    progress.categories.forEach(category => {
      categoryMap.set(category, { attempted: 0, answered: 0, skipped: 0, score: 0 });
    });

    // Count questions by category
    progress.answers.forEach(answer => {
      const category = answer.category;
      const stats = categoryMap.get(category);
      if (stats) {
        if (answer.isAnswered) {
          stats.answered++;
          stats.attempted++;
        } else if (answer.isSkipped) {
          stats.skipped++;
          stats.attempted++;
        }
      }
    });

    // Calculate scores for each category
    categoryMap.forEach((stats, category) => {
      if (stats.attempted > 0) {
        stats.score = Math.round((stats.answered / stats.attempted) * 100);
      }
    });

    return Array.from(categoryMap.entries()).map(([category, stats]) => ({
      category,
      ...stats
    }));
  }

  public getTimeAnalysis(studentId: string): { avgTimePerQuestion: number; totalTime: number; timeRemaining: number } {
    const progress = this.examProgress.get(studentId);
    if (!progress) return { avgTimePerQuestion: 0, totalTime: 0, timeRemaining: 0 };

    const answeredQuestions = progress.answers.filter(q => q.isAnswered || q.isSkipped);
    const totalTimeSpent = answeredQuestions.reduce((sum, q) => sum + q.timeSpent, 0);
    const avgTimePerQuestion = answeredQuestions.length > 0 ? totalTimeSpent / answeredQuestions.length : 0;
    
    // Assuming 3 hours (10800 seconds) exam duration
    const examDuration = 10800; // 3 hours in seconds
    const timeRemaining = Math.max(0, examDuration - progress.timeSpent);

    return {
      avgTimePerQuestion: Math.round(avgTimePerQuestion),
      totalTime: progress.timeSpent,
      timeRemaining
    };
  }

  private updateProgressCounts(progress: ExamProgress): void {
    progress.questionsAttempted = progress.answers.filter(q => q.isAnswered || q.isSkipped).length;
    progress.questionsAnswered = progress.answers.filter(q => q.isAnswered).length;
    progress.questionsSkipped = progress.answers.filter(q => q.isSkipped).length;
  }

  private getCategoryForQuestion(questionId: number): string {
    if (questionId <= 5) return 'Data Structures';
    if (questionId <= 10) return 'Algorithms';
    if (questionId <= 15) return 'OOP';
    if (questionId <= 20) return 'DBMS';
    if (questionId <= 25) return 'Operating Systems';
    if (questionId <= 30) return 'Computer Networks';
    if (questionId <= 35) return 'Software Engineering';
    if (questionId <= 40) return 'Programming Languages';
    if (questionId <= 45) return 'Computer Architecture';
    if (questionId <= 50) return 'Discrete Mathematics';
    if (questionId <= 55) return 'Theory of Computation';
    if (questionId <= 60) return 'Web Technologies';
    if (questionId <= 65) return 'Computer Networks';
    if (questionId <= 70) return 'Software Engineering';
    return 'General';
  }

  public clearExamProgress(studentId: string): void {
    this.examProgress.delete(studentId);
    this.examStartTimes.delete(studentId);
  }
}

export const examService = new ExamService();
