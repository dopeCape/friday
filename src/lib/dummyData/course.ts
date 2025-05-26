type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";
type ModuleType = "content" | "assignment";

interface Chapter {
  _id: string;
  title: string;
  content: any[]; // Simplified since you only want titles
  isGenerated: boolean;
  refs: string[];
  moduleId: string;
  type: string;
  isCompleted: boolean;
  isUserSpecific: boolean;
}

interface Module {
  title: string;
  _id: string;
  description: string;
  courseId: string;
  refs: string[];
  contents: string[];
  isLocked: boolean;
  isCompleted: boolean;
  currentChapterId: string;
  icon: string;
  difficultyLevel: DifficultyLevel;
  prerequisites: string[];
  estimatedCompletionTime: number;
  learningObjectives: string[];
  moduleType: ModuleType;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  isPrivate: boolean;
  isUnique: boolean;
  icon: string[];
  createdBy: string;
  isSystemGenerated: boolean;
  technologies: string[];
  internalDescription: string;
  moduleIds: string[];
  currentModuleId?: string;
  isEnhanced: boolean;
  difficultyLevel: DifficultyLevel;
  prerequisites: string[];
  estimatedCompletionTime: number;
  learningObjectives: string[];
  keywords: string[];
}

const dummyCourseData = {
  course: {
    _id: "course_64f7b2c8e1a9c5d8f2b3a4e5",
    title: "Complete React Mastery",
    description: "Master React from fundamentals to advanced patterns and real-world applications",
    isPrivate: false,
    isUnique: true,
    icon: ["\ue781", "\ue7ba", "\udb84\udfff"],
    createdBy: "user_64f7b2c8e1a9c5d8f2b3a4e1",
    isSystemGenerated: true,
    technologies: ["React", "JavaScript", "TypeScript", "HTML", "CSS", "Node.js"],
    internalDescription: "Comprehensive React course covering components, hooks, state management, routing, testing, and deployment with modern best practices",
    moduleIds: [
      "module_64f7b2c8e1a9c5d8f2b3a4e6",
      "module_64f7b2c8e1a9c5d8f2b3a4e7",
      "module_64f7b2c8e1a9c5d8f2b3a4e8",
      "module_64f7b2c8e1a9c5d8f2b3a4e9",
      "module_64f7b2c8e1a9c5d8f2b3a4ea"
    ],
    currentModuleId: "module_64f7b2c8e1a9c5d8f2b3a4e6",
    isEnhanced: true,
    difficultyLevel: "intermediate" as DifficultyLevel,
    prerequisites: ["Basic JavaScript", "HTML/CSS", "ES6+ features"],
    estimatedCompletionTime: 40,
    learningObjectives: [
      "Build modern React applications with hooks and functional components",
      "Implement state management patterns and context API",
      "Create reusable and maintainable component architectures",
      "Test React applications with Jest and React Testing Library",
      "Deploy React applications to production"
    ],
    keywords: ["react", "javascript", "frontend", "web development", "components", "hooks", "jsx"]
  },

  modules: [
    {
      title: "React Fundamentals",
      _id: "module_64f7b2c8e1a9c5d8f2b3a4e6",
      description: "Learn the core concepts of React including components, JSX, and basic patterns",
      courseId: "course_64f7b2c8e1a9c5d8f2b3a4e5",
      refs: ["react official documentation", "create react app tutorial", "jsx introduction"],
      contents: [
        "chapter_64f7b2c8e1a9c5d8f2b3a4f1",
        "chapter_64f7b2c8e1a9c5d8f2b3a4f2",
        "chapter_64f7b2c8e1a9c5d8f2b3a4f3",
        "chapter_64f7b2c8e1a9c5d8f2b3a4f4"
      ],
      isLocked: false,
      isCompleted: false,
      currentChapterId: "chapter_64f7b2c8e1a9c5d8f2b3a4f1",
      icon: "\ue7ba",
      difficultyLevel: "beginner" as DifficultyLevel,
      prerequisites: ["Basic JavaScript"],
      estimatedCompletionTime: 8,
      learningObjectives: [
        "Understand React components and JSX syntax",
        "Create functional and class components",
        "Handle props and basic state management"
      ],
      moduleType: "content" as ModuleType
    },

    {
      title: "State Management & Hooks",
      _id: "module_64f7b2c8e1a9c5d8f2b3a4e7",
      description: "Deep dive into React hooks and modern state management patterns",
      courseId: "course_64f7b2c8e1a9c5d8f2b3a4e5",
      refs: ["react hooks documentation", "useState patterns", "useEffect best practices"],
      contents: [
        "chapter_64f7b2c8e1a9c5d8f2b3a4f5",
        "chapter_64f7b2c8e1a9c5d8f2b3a4f6",
        "chapter_64f7b2c8e1a9c5d8f2b3a4f7",
        "chapter_64f7b2c8e1a9c5d8f2b3a4f8"
      ],
      isLocked: true,
      isCompleted: false,
      currentChapterId: "chapter_64f7b2c8e1a9c5d8f2b3a4f5",
      icon: "󰑓",
      difficultyLevel: "intermediate" as DifficultyLevel,
      prerequisites: ["React Fundamentals"],
      estimatedCompletionTime: 10,
      learningObjectives: [
        "Master useState and useEffect hooks",
        "Implement custom hooks for reusable logic",
        "Understand advanced state patterns"
      ],
      moduleType: "content" as ModuleType
    },

    {
      title: "Component Architecture",
      _id: "module_64f7b2c8e1a9c5d8f2b3a4e8",
      description: "Learn advanced component patterns and architectural decisions",
      courseId: "course_64f7b2c8e1a9c5d8f2b3a4e5",
      refs: ["component composition patterns", "render props", "higher order components"],
      contents: [
        "chapter_64f7b2c8e1a9c5d8f2b3a4f9",
        "chapter_64f7b2c8e1a9c5d8f2b3a4fa",
        "chapter_64f7b2c8e1a9c5d8f2b3a4fb",
        "chapter_64f7b2c8e1a9c5d8f2b3a4fc"
      ],
      isLocked: true,
      isCompleted: false,
      currentChapterId: "chapter_64f7b2c8e1a9c5d8f2b3a4f9",
      icon: "",
      difficultyLevel: "advanced" as DifficultyLevel,
      prerequisites: ["State Management & Hooks"],
      estimatedCompletionTime: 12,
      learningObjectives: [
        "Design scalable component architectures",
        "Implement advanced patterns like compound components",
        "Optimize component performance and reusability"
      ],
      moduleType: "content" as ModuleType
    },

    {
      title: "Testing & Quality Assurance",
      _id: "module_64f7b2c8e1a9c5d8f2b3a4e9",
      description: "Comprehensive testing strategies for React applications",
      courseId: "course_64f7b2c8e1a9c5d8f2b3a4e5",
      refs: ["jest testing framework", "react testing library", "testing best practices"],
      contents: [
        "chapter_64f7b2c8e1a9c5d8f2b3a4fd",
        "chapter_64f7b2c8e1a9c5d8f2b3a4fe",
        "chapter_64f7b2c8e1a9c5d8f2b3a4ff",
        "chapter_64f7b2c8e1a9c5d8f2b3a500"
      ],
      isLocked: true,
      isCompleted: false,
      currentChapterId: "chapter_64f7b2c8e1a9c5d8f2b3a4fd",
      icon: "󰙨",
      difficultyLevel: "intermediate" as DifficultyLevel,
      prerequisites: ["Component Architecture"],
      estimatedCompletionTime: 8,
      learningObjectives: [
        "Write unit tests for React components",
        "Implement integration testing strategies",
        "Ensure code quality with automated testing"
      ],
      moduleType: "content" as ModuleType
    },

    {
      title: "Final Project",
      _id: "module_64f7b2c8e1a9c5d8f2b3a4ea",
      description: "Build a complete React application applying all learned concepts",
      courseId: "course_64f7b2c8e1a9c5d8f2b3a4e5",
      refs: ["project planning guide", "deployment strategies", "performance optimization"],
      contents: [
        "chapter_64f7b2c8e1a9c5d8f2b3a501",
        "chapter_64f7b2c8e1a9c5d8f2b3a502",
        "chapter_64f7b2c8e1a9c5d8f2b3a503"
      ],
      isLocked: true,
      isCompleted: false,
      currentChapterId: "chapter_64f7b2c8e1a9c5d8f2b3a501",
      icon: "󰞇",
      difficultyLevel: "advanced" as DifficultyLevel,
      prerequisites: ["Testing & Quality Assurance"],
      estimatedCompletionTime: 12,
      learningObjectives: [
        "Build a production-ready React application",
        "Deploy to cloud platforms",
        "Implement performance optimizations"
      ],
      moduleType: "assignment" as ModuleType
    }
  ],

  chapters: [
    // React Fundamentals chapters
    {
      _id: "chapter_64f7b2c8e1a9c5d8f2b3a4f1",
      title: "What is React and Why Use It?",
      content: [],
      isGenerated: true,
      refs: ["react philosophy", "virtual dom explanation"],
      moduleId: "module_64f7b2c8e1a9c5d8f2b3a4e6",
      type: "chapter",
      isCompleted: false,
      isUserSpecific: false
    },
    {
      _id: "chapter_64f7b2c8e1a9c5d8f2b3a4f2",
      title: "Setting Up Your Development Environment",
      content: [],
      isGenerated: true,
      refs: ["create react app", "development tools"],
      moduleId: "module_64f7b2c8e1a9c5d8f2b3a4e6",
      type: "chapter",
      isCompleted: false,
      isUserSpecific: false
    },
    {
      _id: "chapter_64f7b2c8e1a9c5d8f2b3a4f3",
      title: "Your First React Component",
      content: [],
      isGenerated: true,
      refs: ["jsx syntax", "component basics"],
      moduleId: "module_64f7b2c8e1a9c5d8f2b3a4e6",
      type: "chapter",
      isCompleted: false,
      isUserSpecific: false
    },
    {
      _id: "chapter_64f7b2c8e1a9c5d8f2b3a4f4",
      title: "Props and Component Communication",
      content: [],
      isGenerated: true,
      refs: ["props passing", "component communication"],
      moduleId: "module_64f7b2c8e1a9c5d8f2b3a4e6",
      type: "chapter",
      isCompleted: false,
      isUserSpecific: false
    },

    // State Management & Hooks chapters
    {
      _id: "chapter_64f7b2c8e1a9c5d8f2b3a4f5",
      title: "Introduction to React Hooks",
      content: [],
      isGenerated: true,
      refs: ["hooks introduction", "useState basics"],
      moduleId: "module_64f7b2c8e1a9c5d8f2b3a4e7",
      type: "chapter",
      isCompleted: false,
      isUserSpecific: false
    },
    {
      _id: "chapter_64f7b2c8e1a9c5d8f2b3a4f6",
      title: "Managing State with useState",
      content: [],
      isGenerated: true,
      refs: ["useState patterns", "state management"],
      moduleId: "module_64f7b2c8e1a9c5d8f2b3a4e7",
      type: "chapter",
      isCompleted: false,
      isUserSpecific: false
    },
    {
      _id: "chapter_64f7b2c8e1a9c5d8f2b3a4f7",
      title: "Side Effects with useEffect",
      content: [],
      isGenerated: true,
      refs: ["useEffect guide", "lifecycle methods"],
      moduleId: "module_64f7b2c8e1a9c5d8f2b3a4e7",
      type: "chapter",
      isCompleted: false,
      isUserSpecific: false
    },
    {
      _id: "chapter_64f7b2c8e1a9c5d8f2b3a4f8",
      title: "Building Custom Hooks",
      content: [],
      isGenerated: true,
      refs: ["custom hooks", "reusable logic"],
      moduleId: "module_64f7b2c8e1a9c5d8f2b3a4e7",
      type: "chapter",
      isCompleted: false,
      isUserSpecific: false
    },

    // Component Architecture chapters
    {
      _id: "chapter_64f7b2c8e1a9c5d8f2b3a4f9",
      title: "Component Composition Patterns",
      content: [],
      isGenerated: true,
      refs: ["composition vs inheritance", "component patterns"],
      moduleId: "module_64f7b2c8e1a9c5d8f2b3a4e8",
      type: "chapter",
      isCompleted: false,
      isUserSpecific: false
    },
    {
      _id: "chapter_64f7b2c8e1a9c5d8f2b3a4fa",
      title: "Higher-Order Components (HOCs)",
      content: [],
      isGenerated: true,
      refs: ["HOC patterns", "component enhancement"],
      moduleId: "module_64f7b2c8e1a9c5d8f2b3a4e8",
      type: "chapter",
      isCompleted: false,
      isUserSpecific: false
    },
    {
      _id: "chapter_64f7b2c8e1a9c5d8f2b3a4fb",
      title: "Render Props and Function as Children",
      content: [],
      isGenerated: true,
      refs: ["render props pattern", "function as children"],
      moduleId: "module_64f7b2c8e1a9c5d8f2b3a4e8",
      type: "chapter",
      isCompleted: false,
      isUserSpecific: false
    },
    {
      _id: "chapter_64f7b2c8e1a9c5d8f2b3a4fc",
      title: "Performance Optimization Techniques",
      content: [],
      isGenerated: true,
      refs: ["react memo", "useMemo", "useCallback"],
      moduleId: "module_64f7b2c8e1a9c5d8f2b3a4e8",
      type: "chapter",
      isCompleted: false,
      isUserSpecific: false
    },

    // Testing chapters
    {
      _id: "chapter_64f7b2c8e1a9c5d8f2b3a4fd",
      title: "Introduction to Testing React",
      content: [],
      isGenerated: true,
      refs: ["testing philosophy", "testing pyramid"],
      moduleId: "module_64f7b2c8e1a9c5d8f2b3a4e9",
      type: "chapter",
      isCompleted: false,
      isUserSpecific: false
    },
    {
      _id: "chapter_64f7b2c8e1a9c5d8f2b3a4fe",
      title: "Unit Testing Components",
      content: [],
      isGenerated: true,
      refs: ["jest", "react testing library"],
      moduleId: "module_64f7b2c8e1a9c5d8f2b3a4e9",
      type: "chapter",
      isCompleted: false,
      isUserSpecific: false
    },
    {
      _id: "chapter_64f7b2c8e1a9c5d8f2b3a4ff",
      title: "Integration Testing Strategies",
      content: [],
      isGenerated: true,
      refs: ["integration testing", "mocking"],
      moduleId: "module_64f7b2c8e1a9c5d8f2b3a4e9",
      type: "chapter",
      isCompleted: false,
      isUserSpecific: false
    },
    {
      _id: "chapter_64f7b2c8e1a9c5d8f2b3a500",
      title: "End-to-End Testing with Cypress",
      content: [],
      isGenerated: true,
      refs: ["cypress testing", "e2e best practices"],
      moduleId: "module_64f7b2c8e1a9c5d8f2b3a4e9",
      type: "chapter",
      isCompleted: false,
      isUserSpecific: false
    },

    // Final Project chapters
    {
      _id: "chapter_64f7b2c8e1a9c5d8f2b3a501",
      title: "Project Planning and Architecture",
      content: [],
      isGenerated: true,
      refs: ["project structure", "architecture planning"],
      moduleId: "module_64f7b2c8e1a9c5d8f2b3a4ea",
      type: "chapter",
      isCompleted: false,
      isUserSpecific: false
    },
    {
      _id: "chapter_64f7b2c8e1a9c5d8f2b3a502",
      title: "Building the Application",
      content: [],
      isGenerated: true,
      refs: ["development workflow", "best practices"],
      moduleId: "module_64f7b2c8e1a9c5d8f2b3a4ea",
      type: "chapter",
      isCompleted: false,
      isUserSpecific: false
    },
    {
      _id: "chapter_64f7b2c8e1a9c5d8f2b3a503",
      title: "Deployment and Production",
      content: [],
      isGenerated: true,
      refs: ["deployment strategies", "production optimization"],
      moduleId: "module_64f7b2c8e1a9c5d8f2b3a4ea",
      type: "chapter",
      isCompleted: false,
      isUserSpecific: false
    }
  ]
};

export default dummyCourseData;
