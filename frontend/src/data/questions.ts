export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
}

export const questions: Question[] = [
  // Data Structures Questions (1-15)
  {
    id: 1,
    question: "What is the time complexity of inserting an element at the beginning of a linked list?",
    options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
    correctAnswer: "O(1)",
    category: "Data Structures"
  },
  {
    id: 2,
    question: "Which data structure follows LIFO (Last In First Out) principle?",
    options: ["Queue", "Stack", "Array", "Linked List"],
    correctAnswer: "Stack",
    category: "Data Structures"
  },
  {
    id: 3,
    question: "What is the maximum number of nodes at level 'l' of a binary tree?",
    options: ["2^l", "2^(l-1)", "2^(l+1)", "l^2"],
    correctAnswer: "2^l",
    category: "Data Structures"
  },
  {
    id: 4,
    question: "Which of the following is NOT a linear data structure?",
    options: ["Array", "Stack", "Queue", "Tree"],
    correctAnswer: "Tree",
    category: "Data Structures"
  },
  {
    id: 5,
    question: "In a hash table, what is the process of handling collisions using linked lists called?",
    options: ["Open Addressing", "Chaining", "Double Hashing", "Quadratic Probing"],
    correctAnswer: "Chaining",
    category: "Data Structures"
  },

  // Algorithms Questions (6-20)
  {
    id: 6,
    question: "What is the worst-case time complexity of Quick Sort?",
    options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
    correctAnswer: "O(n²)",
    category: "Algorithms"
  },
  {
    id: 7,
    question: "Which algorithm is used to find the shortest path between all pairs of vertices?",
    options: ["Dijkstra's Algorithm", "Floyd-Warshall Algorithm", "Bellman-Ford Algorithm", "DFS"],
    correctAnswer: "Floyd-Warshall Algorithm",
    category: "Algorithms"
  },
  {
    id: 8,
    question: "Binary Search works on which principle?",
    options: ["Divide and Conquer", "Dynamic Programming", "Greedy Method", "Backtracking"],
    correctAnswer: "Divide and Conquer",
    category: "Algorithms"
  },
  {
    id: 9,
    question: "Which sorting algorithm is stable and has O(n log n) time complexity in all cases?",
    options: ["Quick Sort", "Heap Sort", "Merge Sort", "Selection Sort"],
    correctAnswer: "Merge Sort",
    category: "Algorithms"
  },
  {
    id: 10,
    question: "What is the time complexity of BFS (Breadth-First Search) for a graph with V vertices and E edges?",
    options: ["O(V)", "O(E)", "O(V + E)", "O(V * E)"],
    correctAnswer: "O(V + E)",
    category: "Algorithms"
  },

  // Object-Oriented Programming Questions (11-25)
  {
    id: 11,
    question: "Which of the following is NOT a pillar of Object-Oriented Programming?",
    options: ["Encapsulation", "Inheritance", "Polymorphism", "Compilation"],
    correctAnswer: "Compilation",
    category: "OOP"
  },
  {
    id: 12,
    question: "What is method overloading?",
    options: [
      "Same method name with different parameters",
      "Different method names with same parameters",
      "Same method in different classes",
      "Method with no parameters"
    ],
    correctAnswer: "Same method name with different parameters",
    category: "OOP"
  },
  {
    id: 13,
    question: "Which access modifier allows access from anywhere in the program?",
    options: ["private", "protected", "public", "default"],
    correctAnswer: "public",
    category: "OOP"
  },
  {
    id: 14,
    question: "What is the concept of hiding implementation details called?",
    options: ["Abstraction", "Encapsulation", "Inheritance", "Polymorphism"],
    correctAnswer: "Encapsulation",
    category: "OOP"
  },
  {
    id: 15,
    question: "In Java, which keyword is used to inherit a class?",
    options: ["inherits", "extends", "implements", "super"],
    correctAnswer: "extends",
    category: "OOP"
  },

  // Database Management Systems Questions (16-30)
  {
    id: 16,
    question: "What does ACID stand for in database management?",
    options: [
      "Atomicity, Consistency, Isolation, Durability",
      "Association, Consistency, Isolation, Durability",
      "Atomicity, Concurrency, Isolation, Durability",
      "Atomicity, Consistency, Integration, Durability"
    ],
    correctAnswer: "Atomicity, Consistency, Isolation, Durability",
    category: "DBMS"
  },
  {
    id: 17,
    question: "Which normal form eliminates partial dependencies?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    correctAnswer: "2NF",
    category: "DBMS"
  },
  {
    id: 18,
    question: "What is a foreign key?",
    options: [
      "A key from another table",
      "A primary key in the same table",
      "A unique key",
      "An index key"
    ],
    correctAnswer: "A key from another table",
    category: "DBMS"
  },
  {
    id: 19,
    question: "Which SQL command is used to remove duplicates?",
    options: ["UNIQUE", "DISTINCT", "REMOVE", "DELETE"],
    correctAnswer: "DISTINCT",
    category: "DBMS"
  },
  {
    id: 20,
    question: "What is the purpose of indexing in databases?",
    options: [
      "To store data",
      "To speed up query execution",
      "To maintain relationships",
      "To backup data"
    ],
    correctAnswer: "To speed up query execution",
    category: "DBMS"
  },

  // Operating Systems Questions (21-35)
  {
    id: 21,
    question: "What is a deadlock in operating systems?",
    options: [
      "A process that runs indefinitely",
      "Two or more processes waiting for each other",
      "A process that uses too much memory",
      "A crashed process"
    ],
    correctAnswer: "Two or more processes waiting for each other",
    category: "Operating Systems"
  },
  {
    id: 22,
    question: "Which scheduling algorithm gives the shortest average waiting time?",
    options: ["FCFS", "SJF", "Round Robin", "Priority"],
    correctAnswer: "SJF",
    category: "Operating Systems"
  },
  {
    id: 23,
    question: "What is virtual memory?",
    options: [
      "Physical RAM",
      "Cache memory",
      "Simulated memory using disk space",
      "ROM memory"
    ],
    correctAnswer: "Simulated memory using disk space",
    category: "Operating Systems"
  },
  {
    id: 24,
    question: "Which of the following is NOT a process state?",
    options: ["Running", "Waiting", "Ready", "Compiled"],
    correctAnswer: "Compiled",
    category: "Operating Systems"
  },
  {
    id: 25,
    question: "What is the main function of a file system?",
    options: [
      "Execute programs",
      "Manage memory",
      "Organize and store files",
      "Handle interrupts"
    ],
    correctAnswer: "Organize and store files",
    category: "Operating Systems"
  },

  // Computer Networks Questions (26-40)
  {
    id: 26,
    question: "What does TCP stand for?",
    options: [
      "Transmission Control Protocol",
      "Transfer Control Protocol",
      "Transport Control Protocol",
      "Technical Control Protocol"
    ],
    correctAnswer: "Transmission Control Protocol",
    category: "Computer Networks"
  },
  {
    id: 27,
    question: "Which layer of the OSI model is responsible for routing?",
    options: ["Physical", "Data Link", "Network", "Transport"],
    correctAnswer: "Network",
    category: "Computer Networks"
  },
  {
    id: 28,
    question: "What is the maximum segment size in TCP?",
    options: ["64 KB", "1500 bytes", "65535 bytes", "It varies"],
    correctAnswer: "It varies",
    category: "Computer Networks"
  },
  {
    id: 29,
    question: "Which protocol is used for email transmission?",
    options: ["HTTP", "FTP", "SMTP", "DNS"],
    correctAnswer: "SMTP",
    category: "Computer Networks"
  },
  {
    id: 30,
    question: "What is the purpose of ARP (Address Resolution Protocol)?",
    options: [
      "Translate IP to MAC address",
      "Translate domain names to IP",
      "Route packets",
      "Encrypt data"
    ],
    correctAnswer: "Translate IP to MAC address",
    category: "Computer Networks"
  },

  // Software Engineering Questions (31-45)
  {
    id: 31,
    question: "Which software development model follows a linear sequential approach?",
    options: ["Agile", "Waterfall", "Spiral", "RAD"],
    correctAnswer: "Waterfall",
    category: "Software Engineering"
  },
  {
    id: 32,
    question: "What is the purpose of unit testing?",
    options: [
      "Test the entire system",
      "Test individual components",
      "Test user interface",
      "Test database"
    ],
    correctAnswer: "Test individual components",
    category: "Software Engineering"
  },
  {
    id: 33,
    question: "Which UML diagram shows the interaction between objects over time?",
    options: ["Class Diagram", "Use Case Diagram", "Sequence Diagram", "Activity Diagram"],
    correctAnswer: "Sequence Diagram",
    category: "Software Engineering"
  },
  {
    id: 34,
    question: "What is refactoring?",
    options: [
      "Adding new features",
      "Fixing bugs",
      "Improving code structure without changing functionality",
      "Testing code"
    ],
    correctAnswer: "Improving code structure without changing functionality",
    category: "Software Engineering"
  },
  {
    id: 35,
    question: "Which principle states that software entities should be open for extension but closed for modification?",
    options: [
      "Single Responsibility Principle",
      "Open/Closed Principle",
      "Liskov Substitution Principle",
      "Dependency Inversion Principle"
    ],
    correctAnswer: "Open/Closed Principle",
    category: "Software Engineering"
  },

  // Programming Languages Questions (36-50)
  {
    id: 36,
    question: "Which of the following is a dynamically typed language?",
    options: ["C++", "Java", "Python", "C#"],
    correctAnswer: "Python",
    category: "Programming Languages"
  },
  {
    id: 37,
    question: "What is garbage collection?",
    options: [
      "Deleting unused files",
      "Automatic memory management",
      "Code optimization",
      "Error handling"
    ],
    correctAnswer: "Automatic memory management",
    category: "Programming Languages"
  },
  {
    id: 38,
    question: "Which keyword is used to define a constant in C++?",
    options: ["final", "const", "static", "readonly"],
    correctAnswer: "const",
    category: "Programming Languages"
  },
  {
    id: 39,
    question: "What does JVM stand for?",
    options: [
      "Java Virtual Machine",
      "Java Variable Manager",
      "Java Version Manager",
      "Java Verification Module"
    ],
    correctAnswer: "Java Virtual Machine",
    category: "Programming Languages"
  },
  {
    id: 40,
    question: "Which data type in Python is ordered and changeable?",
    options: ["Tuple", "Set", "List", "Dictionary"],
    correctAnswer: "List",
    category: "Programming Languages"
  },

  // Computer Architecture Questions (41-55)
  {
    id: 41,
    question: "What is the purpose of cache memory?",
    options: [
      "Permanent storage",
      "Backup storage",
      "Fast temporary storage",
      "Virtual storage"
    ],
    correctAnswer: "Fast temporary storage",
    category: "Computer Architecture"
  },
  {
    id: 42,
    question: "Which component of CPU performs arithmetic and logical operations?",
    options: ["Control Unit", "ALU", "Registers", "Cache"],
    correctAnswer: "ALU",
    category: "Computer Architecture"
  },
  {
    id: 43,
    question: "What is pipelining in CPU?",
    options: [
      "Parallel execution of instructions",
      "Sequential execution of instructions",
      "Storage of instructions",
      "Decoding of instructions"
    ],
    correctAnswer: "Parallel execution of instructions",
    category: "Computer Architecture"
  },
  {
    id: 44,
    question: "Which memory has the fastest access time?",
    options: ["RAM", "Cache", "Hard Disk", "ROM"],
    correctAnswer: "Cache",
    category: "Computer Architecture"
  },
  {
    id: 45,
    question: "What is the word size of a 64-bit processor?",
    options: ["32 bits", "64 bits", "128 bits", "16 bits"],
    correctAnswer: "64 bits",
    category: "Computer Architecture"
  },

  // Discrete Mathematics Questions (46-60)
  {
    id: 46,
    question: "What is the complement of the set {1, 2, 3} in the universal set {1, 2, 3, 4, 5}?",
    options: ["{1, 2, 3}", "{4, 5}", "{1, 2, 3, 4, 5}", "{}"],
    correctAnswer: "{4, 5}",
    category: "Discrete Mathematics"
  },
  {
    id: 47,
    question: "How many edges does a complete graph with n vertices have?",
    options: ["n", "n-1", "n(n-1)/2", "n²"],
    correctAnswer: "n(n-1)/2",
    category: "Discrete Mathematics"
  },
  {
    id: 48,
    question: "What is the logical equivalent of 'NOT (A AND B)'?",
    options: ["NOT A OR NOT B", "NOT A AND NOT B", "A OR B", "A AND B"],
    correctAnswer: "NOT A OR NOT B",
    category: "Discrete Mathematics"
  },
  {
    id: 49,
    question: "In how many ways can 5 people be arranged in a row?",
    options: ["25", "120", "60", "5"],
    correctAnswer: "120",
    category: "Discrete Mathematics"
  },
  {
    id: 50,
    question: "What is the chromatic number of a tree with n vertices (n > 1)?",
    options: ["1", "2", "3", "n"],
    correctAnswer: "2",
    category: "Discrete Mathematics"
  },

  // Theory of Computation Questions (51-65)
  {
    id: 51,
    question: "Which automaton can recognize context-free languages?",
    options: ["Finite Automaton", "Pushdown Automaton", "Turing Machine", "Linear Bounded Automaton"],
    correctAnswer: "Pushdown Automaton",
    category: "Theory of Computation"
  },
  {
    id: 52,
    question: "What is the pumping lemma used for?",
    options: [
      "Proving a language is regular",
      "Proving a language is not regular",
      "Converting NFA to DFA",
      "Minimizing automata"
    ],
    correctAnswer: "Proving a language is not regular",
    category: "Theory of Computation"
  },
  {
    id: 53,
    question: "Which of the following problems is undecidable?",
    options: [
      "Whether a CFG generates a finite language",
      "Whether two DFAs are equivalent",
      "The Halting Problem",
      "Whether a regular expression matches a string"
    ],
    correctAnswer: "The Halting Problem",
    category: "Theory of Computation"
  },
  {
    id: 54,
    question: "What is the time complexity class P?",
    options: [
      "Problems solvable in polynomial time",
      "Problems solvable in exponential time",
      "Problems solvable in logarithmic time",
      "Problems solvable in constant time"
    ],
    correctAnswer: "Problems solvable in polynomial time",
    category: "Theory of Computation"
  },
  {
    id: 55,
    question: "Which grammar generates the language {aⁿbⁿ | n ≥ 1}?",
    options: [
      "Regular Grammar",
      "Context-Free Grammar",
      "Context-Sensitive Grammar",
      "Unrestricted Grammar"
    ],
    correctAnswer: "Context-Free Grammar",
    category: "Theory of Computation"
  },

  // Web Technologies Questions (56-70)
  {
    id: 56,
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Tech Modern Language",
      "Home Tool Markup Language",
      "Hyperlink and Text Markup Language"
    ],
    correctAnswer: "Hyper Text Markup Language",
    category: "Web Technologies"
  },
  {
    id: 57,
    question: "Which CSS property is used to change the text color of an element?",
    options: ["color", "text-color", "font-color", "background-color"],
    correctAnswer: "color",
    category: "Web Technologies"
  },
  {
    id: 58,
    question: "What is the correct way to include an external JavaScript file?",
    options: [
      "<script href='script.js'>",
      "<script src='script.js'>",
      "<javascript src='script.js'>",
      "<js src='script.js'>"
    ],
    correctAnswer: "<script src='script.js'>",
    category: "Web Technologies"
  },
  {
    id: 59,
    question: "Which HTTP method is used to retrieve data from a server?",
    options: ["POST", "PUT", "GET", "DELETE"],
    correctAnswer: "GET",
    category: "Web Technologies"
  },
  {
    id: 60,
    question: "What is the purpose of the alt attribute in HTML img tag?",
    options: [
      "To specify image alignment",
      "To provide alternative text for images",
      "To set image size",
      "To add image border"
    ],
    correctAnswer: "To provide alternative text for images",
    category: "Web Technologies"
  },

  // Additional Computer Engineering Questions (61-70)
  {
    id: 61,
    question: "What is the main advantage of IPv6 over IPv4?",
    options: [
      "Faster transmission",
      "Better security",
      "Larger address space",
      "Lower cost"
    ],
    correctAnswer: "Larger address space",
    category: "Computer Networks"
  },
  {
    id: 62,
    question: "Which design pattern ensures a class has only one instance?",
    options: ["Factory", "Singleton", "Observer", "Strategy"],
    correctAnswer: "Singleton",
    category: "Software Engineering"
  },
  {
    id: 63,
    question: "What is the worst-case space complexity of merge sort?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    correctAnswer: "O(n)",
    category: "Algorithms"
  },
  {
    id: 64,
    question: "In relational databases, what is a candidate key?",
    options: [
      "A key that is being considered for primary key",
      "A foreign key",
      "A composite key",
      "An index key"
    ],
    correctAnswer: "A key that is being considered for primary key",
    category: "DBMS"
  },
  {
    id: 65,
    question: "What is the main purpose of an operating system kernel?",
    options: [
      "Manage user interface",
      "Manage system resources",
      "Execute applications",
      "Store files"
    ],
    correctAnswer: "Manage system resources",
    category: "Operating Systems"
  },
  {
    id: 66,
    question: "Which data structure is used to implement recursion?",
    options: ["Queue", "Stack", "Array", "Tree"],
    correctAnswer: "Stack",
    category: "Data Structures"
  },
  {
    id: 67,
    question: "What does API stand for?",
    options: [
      "Application Program Interface",
      "Application Programming Interface",
      "Applied Program Interface",
      "Advanced Programming Interface"
    ],
    correctAnswer: "Application Programming Interface",
    category: "Software Engineering"
  },
  {
    id: 68,
    question: "Which protocol is used for secure web communication?",
    options: ["HTTP", "HTTPS", "FTP", "SMTP"],
    correctAnswer: "HTTPS",
    category: "Computer Networks"
  },
  {
    id: 69,
    question: "What is the primary purpose of version control systems?",
    options: [
      "Compile code",
      "Track changes in files",
      "Execute programs",
      "Debug applications"
    ],
    correctAnswer: "Track changes in files",
    category: "Software Engineering"
  },
  {
    id: 70,
    question: "Which sorting algorithm has the best average-case time complexity?",
    options: ["Bubble Sort", "Selection Sort", "Quick Sort", "Insertion Sort"],
    correctAnswer: "Quick Sort",
    category: "Algorithms"
  }
];