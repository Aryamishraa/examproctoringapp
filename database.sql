-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 09, 2026 at 07:11 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `safeexaminers`
--

-- --------------------------------------------------------

--
-- Table structure for table `exams`
--

CREATE TABLE `exams` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `exam_start_time` datetime NOT NULL DEFAULT current_timestamp(),
  `exam_end_time` datetime DEFAULT NULL,
  `total_questions` int(11) DEFAULT 70,
  `questions_attempted` int(11) DEFAULT 0,
  `questions_answered` int(11) DEFAULT 0,
  `questions_skipped` int(11) DEFAULT 0,
  `score` decimal(5,2) DEFAULT NULL,
  `time_spent` int(11) DEFAULT 0,
  `status` enum('in_progress','completed','abandoned') DEFAULT 'in_progress',
  `recording_path` varchar(500) DEFAULT NULL,
  `recording_size` bigint(20) DEFAULT NULL,
  `warnings` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exam_answers`
--

CREATE TABLE `exam_answers` (
  `id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `selected_answer` varchar(10) DEFAULT NULL,
  `is_answered` tinyint(1) DEFAULT 0,
  `is_skipped` tinyint(1) DEFAULT 0,
  `time_spent` int(11) DEFAULT 0,
  `category` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `recordings`
--

CREATE TABLE `recordings` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `exam_id` int(11) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint(20) NOT NULL DEFAULT 0,
  `duration` int(11) DEFAULT 0,
  `mime_type` varchar(100) DEFAULT 'video/webm',
  `recording_start_time` datetime DEFAULT current_timestamp(),
  `recording_end_time` datetime DEFAULT NULL,
  `status` enum('recording','completed','failed','deleted') DEFAULT 'recording',
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `is_public` tinyint(1) DEFAULT 0,
  `download_count` int(11) DEFAULT 0,
  `last_downloaded` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `enrollment_no` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_online` tinyint(1) DEFAULT 0,
  `is_camera_on` tinyint(1) DEFAULT 0,
  `is_mic_on` tinyint(1) DEFAULT 0,
  `is_speaking` tinyint(1) DEFAULT 0,
  `is_tab_active` tinyint(1) DEFAULT 1,
  `last_activity` datetime DEFAULT current_timestamp(),
  `exam_start_time` datetime DEFAULT NULL,
  `warnings` int(11) DEFAULT 0,
  `current_tab` varchar(255) DEFAULT 'Dashboard',
  `connection_quality` enum('excellent','good','poor','disconnected') DEFAULT 'excellent',
  `login_time` datetime DEFAULT NULL,
  `is_in_exam` tinyint(1) DEFAULT 0,
  `total_exams_taken` int(11) DEFAULT 0,
  `average_score` decimal(5,2) DEFAULT 0.00,
  `last_exam_date` datetime DEFAULT NULL,
  `last_exam_score` decimal(5,2) DEFAULT NULL,
  `total_time_spent` int(11) DEFAULT 0,
  `activity_count` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `enrollment_no`, `name`, `password_hash`, `is_online`, `is_camera_on`, `is_mic_on`, `is_speaking`, `is_tab_active`, `last_activity`, `exam_start_time`, `warnings`, `current_tab`, `connection_quality`, `login_time`, `is_in_exam`, `total_exams_taken`, `average_score`, `last_exam_date`, `last_exam_score`, `total_time_spent`, `activity_count`, `created_at`, `updated_at`) VALUES
(1, 'EN0001', 'John Doe', '$2b$10$hFwcK6tS9t8ABA/9yhs/3uyEILZO/HZjjHxd8IItpoq4sXbC8lVGe', 1, 0, 0, 0, 1, '2026-03-09 11:28:05', NULL, 0, 'Dashboard', 'excellent', '2026-03-09 11:28:05', 0, 0, 0.00, NULL, NULL, 0, 0, '2026-03-09 11:03:51', '2026-03-09 11:28:05'),
(2, 'EN0002', 'Jane Smith', '$2b$10$e1RE.nF1esK5DKuQSWYjkukG.msIge8VfB1tByHvGcLj/XWbkxa/C', 0, 0, 0, 0, 1, '2026-03-09 11:03:51', NULL, 0, 'Dashboard', 'excellent', '2026-03-09 11:03:51', 0, 0, 0.00, NULL, NULL, 0, 0, '2026-03-09 11:03:51', '2026-03-09 11:03:51'),
(3, 'EN0003', 'Mike Johnson', '$2b$10$XncgZdhYAcIm9reQi.dkAeiLENhoLwC7GAfIDk.NAgdTh4S3a24ka', 0, 0, 0, 0, 1, '2026-03-09 11:03:51', NULL, 0, 'Dashboard', 'excellent', '2026-03-09 11:03:51', 0, 0, 0.00, NULL, NULL, 0, 0, '2026-03-09 11:03:51', '2026-03-09 11:03:51');

-- --------------------------------------------------------

--
-- Table structure for table `student_activities`
--

CREATE TABLE `student_activities` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `timestamp` datetime NOT NULL DEFAULT current_timestamp(),
  `type` enum('tab_switch','camera_off','camera_on','mic_off','mic_on','speaking','silent','disconnected','reconnected','login','logout','exam_start','exam_submit','question_answer','question_skip','warning_received','student_not_visible') NOT NULL,
  `details` text NOT NULL,
  `severity` enum('low','medium','high') DEFAULT 'low',
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_activities`
--

INSERT INTO `student_activities` (`id`, `student_id`, `timestamp`, `type`, `details`, `severity`, `metadata`, `ip_address`, `user_agent`, `session_id`, `created_at`, `updated_at`) VALUES
(1, 1, '2026-03-09 11:03:51', 'login', 'Student John Doe (EN0001) logged in', 'low', NULL, NULL, NULL, NULL, '2026-03-09 11:03:51', '2026-03-09 11:03:51'),
(2, 2, '2026-03-09 11:03:51', 'login', 'Student Jane Smith (EN0002) logged in', 'low', NULL, NULL, NULL, NULL, '2026-03-09 11:03:51', '2026-03-09 11:03:51'),
(3, 3, '2026-03-09 11:03:51', 'login', 'Student Mike Johnson (EN0003) logged in', 'low', NULL, NULL, NULL, NULL, '2026-03-09 11:03:51', '2026-03-09 11:03:51'),
(4, 1, '2026-03-09 11:28:44', 'login', 'Student John Doe (EN0001) logged in', 'low', NULL, NULL, NULL, NULL, '2026-03-09 11:28:44', '2026-03-09 11:28:44'),
(5, 2, '2026-03-09 11:28:44', 'login', 'Student Jane Smith (EN0002) logged in', 'low', NULL, NULL, NULL, NULL, '2026-03-09 11:28:44', '2026-03-09 11:28:44'),
(6, 3, '2026-03-09 11:28:44', 'login', 'Student Mike Johnson (EN0003) logged in', 'low', NULL, NULL, NULL, NULL, '2026-03-09 11:28:44', '2026-03-09 11:28:44');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `exams`
--
ALTER TABLE `exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_start_time` (`exam_start_time`),
  ADD KEY `idx_score` (`score`);

--
-- Indexes for table `exam_answers`
--
ALTER TABLE `exam_answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_exam` (`exam_id`),
  ADD KEY `idx_question` (`question_id`);

--
-- Indexes for table `recordings`
--
ALTER TABLE `recordings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_exam` (`exam_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_start_time` (`recording_start_time`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `enrollment_no` (`enrollment_no`),
  ADD KEY `idx_enrollment` (`enrollment_no`),
  ADD KEY `idx_online` (`is_online`),
  ADD KEY `idx_in_exam` (`is_in_exam`),
  ADD KEY `idx_last_activity` (`last_activity`);

--
-- Indexes for table `student_activities`
--
ALTER TABLE `student_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student` (`student_id`),
  ADD KEY `idx_timestamp` (`timestamp`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_severity` (`severity`),
  ADD KEY `idx_student_timestamp` (`student_id`,`timestamp`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `exams`
--
ALTER TABLE `exams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exam_answers`
--
ALTER TABLE `exam_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `recordings`
--
ALTER TABLE `recordings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `student_activities`
--
ALTER TABLE `student_activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `exams`
--
ALTER TABLE `exams`
  ADD CONSTRAINT `exams_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exam_answers`
--
ALTER TABLE `exam_answers`
  ADD CONSTRAINT `exam_answers_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `recordings`
--
ALTER TABLE `recordings`
  ADD CONSTRAINT `recordings_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `recordings_ibfk_2` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `student_activities`
--
ALTER TABLE `student_activities`
  ADD CONSTRAINT `student_activities_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
