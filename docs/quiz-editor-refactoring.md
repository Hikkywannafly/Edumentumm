# Quiz Editor Hook Refactoring

## Overview
Successfully split the large 300+ line `use-quiz-editor.ts` file into smaller, focused modules following the project's modular architecture principles, similar to the quiz creator refactoring.

## File Structure

### Before (1 large file)
```
📄 use-quiz-editor.ts (300+ lines)
├── Quiz data loading logic
├── Quiz state management logic
├── Quiz saving logic
├── Question management operations
├── Data conversion utilities
└── Types and interfaces
```

### After (7 focused files)
```
📁 src/hooks/quiz/
├── 📄 use-quiz-editor.ts           (45 lines - Main orchestrator)
├── 📄 use-quiz-loader.ts           (50 lines - Data loading)
├── 📄 use-quiz-state-manager.ts    (65 lines - State management)
├── 📄 use-quiz-saver-editor.ts     (60 lines - Quiz saving)
├── 📄 use-question-manager.ts      (75 lines - Question operations)
├── 📄 quiz-data-converter.ts       (55 lines - Data conversion)
└── 📄 quiz-editor-types.ts         (45 lines - Shared types)
```

## Files Created

### 1. `quiz-editor-types.ts`
- **Purpose**: Shared TypeScript interfaces and types for quiz editor
- **Contents**:
  - `UpdateQuizData` interface
  - Individual hook return types (`UseQuizLoaderReturn`, etc.)
  - Combined interface for main hook
  - Re-exported types from main types file

### 2. `use-quiz-loader.ts`
- **Purpose**: Quiz data fetching from backend
- **Responsibilities**:
  - API calls to `/api/quiz/{id}` endpoint
  - Quiz data validation and error handling
  - Authentication token management
  - Loading state management
- **Key Features**:
  - Proper error handling for failed loads
  - Data structure validation
  - TanStack Query integration

### 3. `use-quiz-state-manager.ts`
- **Purpose**: Quiz state management and optimistic updates
- **Responsibilities**:
  - Local quiz state management with TanStack Query cache
  - Optimistic updates for immediate UI feedback
  - Derived state calculations (hasUnsavedChanges, isValid)
  - Error recovery and state reset
- **Key Features**:
  - Optimistic updates with error rollback
  - Change detection for unsaved changes indicator
  - Form validation logic

### 4. `use-quiz-saver-editor.ts`
- **Purpose**: Save quiz changes to backend
- **Responsibilities**:
  - API calls to PUT `/api/quiz/{id}` endpoint
  - Payload formatting for backend compatibility
  - Cache synchronization after successful save
  - Authentication and error handling
- **Key Features**:
  - Updates both quiz and quiz-editing caches
  - Invalidates quiz list cache
  - Proper error handling and retry logic

### 5. `use-question-manager.ts`
- **Purpose**: Question-specific operations (CRUD)
- **Responsibilities**:
  - Add, update, delete, and move questions
  - Metadata updates (total_questions, total_points)
  - Question array manipulation
  - State coordination with quiz updates
- **Key Features**:
  - Immutable state updates
  - Automatic metadata recalculation
  - Question reordering with drag & drop support

### 6. `quiz-data-converter.ts`
- **Purpose**: Data format conversion between backend and frontend
- **Responsibilities**:
  - Backend quiz format → Frontend GeneratedQuiz format
  - Handle multiple backend data structures (quizData, quiz_data, questions)
  - Metadata extraction and normalization
  - Default value handling
- **Key Features**:
  - Supports multiple backend response formats
  - Robust error handling for missing data
  - Comprehensive logging for debugging

### 7. `use-quiz-editor.ts` (Refactored)
- **Purpose**: Main orchestrator hook
- **Responsibilities**:
  - Compose functionality from specialized hooks
  - Provide unified interface to components
  - Coordinate state between different concerns
  - Combined error and reset functionality

## Benefits Achieved

### 🔧 **Maintainability**
- Each file has a single, clear responsibility
- Easier to locate and fix bugs
- Better separation of concerns
- Cleaner code organization

### 🧪 **Testability**
- Can test data loading independently from state management
- Can mock individual hooks in tests
- Easier unit testing of specific functionality
- Better test isolation

### ♻️ **Reusability**
- Other components can use `useQuizLoader` directly
- Question management logic can be reused elsewhere
- Data conversion utilities can be used in other contexts
- State management patterns can be applied elsewhere

### 📖 **Readability**
- Smaller files are easier to understand
- Clear naming conventions
- Focused functionality per file
- Better code documentation

### 🏗️ **Architecture Compliance**
- Follows project's modular patterns
- Matches existing hook structure
- Proper TypeScript organization
- Consistent with project's React Query usage

## Implementation Details

### Composition Pattern
The main hook uses the composition pattern to combine functionality:
```typescript
export function useQuizEditor(quizId: number): UseQuizEditorReturn {
  const quizLoader = useQuizLoader(quizId);
  const quizStateManager = useQuizStateManager(quizId, quizLoader.originalQuiz);
  const quizSaver = useQuizSaverEditor(quizId, quizStateManager.quiz);
  const questionManager = useQuestionManager(quizStateManager.quiz, quizStateManager.updateQuiz);

  return {
    ...quizLoader,
    ...quizStateManager,
    ...quizSaver,
    ...questionManager,
    // Combined functionality
  };
}
```

### Dependency Injection
Hooks receive dependencies as parameters:
- `useQuizStateManager` receives `originalQuiz` from loader
- `useQuizSaverEditor` receives `quiz` from state manager
- `useQuestionManager` receives `quiz` and `updateQuiz` function
- Clean, testable dependency chain

### Error Handling
Each hook handles its own errors and exposes them through the interface:
- Loading errors from API failures
- State management errors from optimistic updates
- Saving errors from backend issues
- Combined error state in main hook

### Data Flow
```
Backend Quiz Data → useQuizLoader → useQuizStateManager → UI Components
                                          ↓
                    useQuizSaver ← User Actions ← useQuestionManager
```

## Usage
The refactored hooks maintain 100% API compatibility. Existing components like `QuizEditorContent` continue to work without any changes:

```typescript
const {
  quiz,
  isLoading,
  updateQuiz,
  saveQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  // ... all other properties work exactly the same
} = useQuizEditor(quizId);
```

## Project Compliance

✅ **Follows TypeScript strict mode requirements**
✅ **Implements proper error handling patterns**
✅ **Uses TanStack Query for data management**
✅ **Follows project's API integration guidelines**
✅ **Maintains backward compatibility**
✅ **Follows project's file naming conventions**
✅ **Proper biome linting compliance**
✅ **Modular architecture implementation**

## Comparison with Quiz Creator Refactoring

Both refactorings follow the same pattern:
- **Shared types file** for interfaces
- **Specialized hooks** for different concerns
- **Main orchestrator** that composes functionality
- **100% API compatibility** maintained
- **Improved testability** and maintainability

The quiz editor refactoring successfully transforms another monolithic hook into a clean, modular architecture that's easier to maintain, test, and extend, following the established patterns from the quiz creator refactoring.
