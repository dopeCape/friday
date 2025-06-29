"use client"
import React, { useState } from 'react';
import { SlideEngine } from '@/components/VideoRenderer/Components';

// Comprehensive test data showcasing all Friday component types
const fridayTestSlides = [
  {
    template: 'hero',
    props: {
      subtitle: 'DATA STRUCTURES',
      title: 'Understanding Stacks',
      highlight: 'LIFO: Last In, First Out',
      description: 'Master the fundamental stack data structure with visual examples and practical implementations.'
    }
  },
  {
    template: 'concept',
    props: {
      title: 'Basic Operations',
      mainContent: {
        type: 'text',
        value: 'Two fundamental operations define stack behavior. Push adds elements to the top, while pop removes and returns the top element. This simple interface makes stacks incredibly versatile.',
        size: 'body'
      },
      supportingVisual: {
        type: 'ascii-art',
        value: `    Stack State
    
+─────────────+
│     C       │ ← top
├─ ─ ─ ─ ─ ─ ─┤
│     B       │
├─ ─ ─ ─ ─ ─ ─┤
│     A       │
+─────────────+`
      }
    }
  },
  {
    template: 'concept',
    props: {
      title: 'Python Implementation',
      mainContent: {
        type: 'text',
        value: 'Here\'s a clean implementation of a stack in Python. Notice how the interface is minimal yet powerful.',
        size: 'body'
      },
      supportingVisual: {
        type: 'code',
        language: 'python',
        comment: 'Complete stack implementation',
        value: `class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        """Add item to top of stack"""
        self.items.append(item)
    
    def pop(self):
        """Remove and return top item"""
        if self.is_empty():
            raise IndexError("pop from empty stack")
        return self.items.pop()
    
    def peek(self):
        """View top item without removing"""
        if self.is_empty():
            return None
        return self.items[-1]
    
    def is_empty(self):
        """Check if stack is empty"""
        return len(self.items) == 0
    
    def size(self):
        """Get number of items"""
        return len(self.items)`
      }
    }
  },
  {
    template: 'concept',
    props: {
      title: 'Algorithm Flow',
      mainContent: {
        type: 'text',
        value: 'This diagram illustrates how elements flow through stack operations in a typical algorithm execution.',
        size: 'body'
      },
      supportingVisual: {
        type: 'mermaid',
        value: `graph TD
    A[Start: Empty Stack] --> B[Push 'A']
    B --> C[Push 'B']
    C --> D[Push 'C']
    D --> E{Stack: [A,B,C]}
    E --> F[Pop: returns 'C']
    F --> G[Pop: returns 'B']
    G --> H[Pop: returns 'A']
    H --> I[End: Empty Stack]
    
    style A fill:#63a1ff,color:#000
    style I fill:#63a1ff,color:#000
    style E fill:#666768,color:#fff`
      }
    }
  },
  {
    template: 'concept',
    props: {
      title: 'Time Complexity Analysis',
      mainContent: {
        type: 'text',
        value: 'Stack operations maintain constant time complexity regardless of the number of elements stored.',
        size: 'body'
      },
      supportingVisual: {
        type: 'latex',
        value: `\\text{Push Operation: } O(1)

\\text{Pop Operation: } O(1)

\\text{Space Complexity: } O(n)

\\text{where } n = \\text{number of elements}`
      }
    }
  },
  {
    template: 'concept',
    props: {
      title: 'Real-World Applications',
      mainContent: {
        type: 'list',
        items: [
          'Function call management (call stack)',
          'Undo operations in text editors',
          'Browser history navigation',
          'Expression evaluation and syntax parsing',
          'Backtracking algorithms',
          'Memory management in programming languages'
        ]
      },
      supportingVisual: {
        type: 'highlight-box',
        value: 'Pattern Recognition: Whenever you need "last in, first out" behavior, think stacks!',
        primary: true
      }
    }
  },
  {
    template: 'concept',
    props: {
      title: 'Advanced Example',
      mainContent: {
        type: 'markdown',
        value: `**Balanced Parentheses Checker**

- Read each character
- Push opening brackets onto stack  
- Pop when encountering closing brackets
- **Valid if stack is empty at the end**`
      },
      supportingVisual: {
        type: 'code',
        language: 'python',
        comment: 'Practical stack application',
        value: `def is_balanced(expression):
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    
    for char in expression:
        if char in '({[':
            stack.append(char)
        elif char in ')}]':
            if not stack:
                return False
            if stack.pop() != pairs[char]:
                return False
    
    return len(stack) == 0

# Test cases
print(is_balanced("()"))      # True
print(is_balanced("({[]})"))  # True  
print(is_balanced("([)]"))    # False`
      }
    }
  },
  {
    template: 'hero',
    props: {
      subtitle: 'MASTERY ACHIEVED',
      title: 'Stack Complete',
      highlight: 'Ready for Production',
      description: 'You now understand stacks from theory to implementation. Next: queues, trees, and advanced data structures.'
    }
  }
];

const FridayVideoTest = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentSlideData = fridayTestSlides[currentSlide];
  const contentType = currentSlideData?.props?.supportingVisual?.type ||
    currentSlideData?.props?.mainContent?.type || 'hero';

  const handleKeyPress = (e) => {
    if (e.key === 'ArrowRight' && currentSlide < fridayTestSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
    if (e.key === 'ArrowLeft' && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
    if (e.key === 'f' || e.key === 'F') {
      setIsFullscreen(!isFullscreen);
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, isFullscreen]);

  return (
    <div className={`bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : 'w-full h-screen'}`}>
      {/* Navigation Controls */}
      {!isFullscreen && (
        <>
          <div className="absolute top-4 left-4 z-20 bg-gray-800 rounded-lg p-4 text-white text-sm space-y-2">
            <div className="font-bold">Friday Video Components Test</div>
            <div>Content Type: <span className="text-blue-400">{contentType}</span></div>
            <div>Slide: {currentSlide + 1} of {fridayTestSlides.length}</div>
            <div className="text-xs text-gray-400 mt-2">
              Use ← → arrows or buttons to navigate<br />
              Press 'F' for fullscreen
            </div>
          </div>

          <div className="absolute top-4 right-4 z-20 flex gap-2">
            {fridayTestSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${i === currentSlide
                  ? 'bg-blue-500 text-white scale-110'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                title={`Slide ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Navigation Arrows */}
          <div className="absolute top-1/2 left-4 z-20 -translate-y-1/2">
            <button
              onClick={() => currentSlide > 0 && setCurrentSlide(currentSlide - 1)}
              disabled={currentSlide === 0}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${currentSlide === 0
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
            >
              ←
            </button>
          </div>

          <div className="absolute top-1/2 right-4 z-20 -translate-y-1/2">
            <button
              onClick={() => currentSlide < fridayTestSlides.length - 1 && setCurrentSlide(currentSlide + 1)}
              disabled={currentSlide === fridayTestSlides.length - 1}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${currentSlide === fridayTestSlides.length - 1
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
            >
              →
            </button>
          </div>

          {/* Content Info Panel */}
          <div className="absolute bottom-4 left-4 z-20 bg-gray-800 rounded-lg p-4 text-white text-xs max-w-md max-h-48 overflow-y-auto">
            <div className="font-bold mb-2">Current Slide Structure:</div>
            <pre className="text-xs text-gray-300">
              {JSON.stringify(currentSlideData, null, 2)}
            </pre>
          </div>

          {/* Component Status */}
          <div className="absolute bottom-4 right-4 z-20 bg-gray-800 rounded-lg p-4 text-white text-sm">
            <div className="font-bold mb-2">Friday Components</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between gap-4">
                <span>CodeBlock:</span>
                <span className="text-green-400">✓ Active</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Mermaid:</span>
                <span className="text-green-400">✓ Active</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>LaTeX:</span>
                <span className="text-green-400">✓ Active</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>ASCII Art:</span>
                <span className="text-green-400">✓ Active</span>
              </div>
              <div className="flex justify-between gap-4">
                <span>Resolution:</span>
                <span className="text-blue-400">1920×1080</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Fullscreen Toggle */}
      {isFullscreen && (
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={() => setIsFullscreen(false)}
            className="w-10 h-10 rounded-full bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-center"
            title="Exit Fullscreen (F)"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Slide Content */}
      <div className="w-full h-full flex items-center justify-center">
        <SlideEngine slideData={currentSlideData} />
      </div>
    </div>
  );
};

export default FridayVideoTest;
