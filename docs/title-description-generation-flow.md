# Quiz Title and Description Generation Flow

## Overview
This document describes the enhanced AI-powered title and description generation system for quizzes in the Edumentum platform.

## Implementation

### 1. Unified Title Generation Across All Routes

All quiz creation routes now support intelligent AI-powered title and description generation:

- **`/api/quiz/generate`** - Generates titles for AI-created quizzes
- **`/api/quiz/extract`** - Generates titles for extracted quizzes
- **`/api/quiz/create`** - ✅ **NEW**: Generates titles for AI-generated quizzes during final creation

### 2. Smart Language Detection

The system automatically detects content language and generates appropriate titles:

```typescript
// Vietnamese content → Vietnamese titles
"Toán học lớp 12: Hàm số và đạo hàm"

// English content → English titles
"Mathematics Grade 12: Functions and Derivatives"
```

### 3. Intelligent Topic Extraction

When no filename is available (like in the create route), the system:

1. **Extracts topics from question tags** - Uses existing question metadata
2. **Detects subject matter from content** - Analyzes content for topic keywords
3. **Provides contextual fallbacks** - Creates meaningful titles even without perfect data

### 4. Enhanced Create Route Logic

The `/api/quiz/create` route now includes conditional AI title generation:

```typescript
// Only generate AI titles for AI-generated quizzes
if (data.isAiGenerated && data.quizData.questions.length > 0) {
  const titleDescResult = await generateQuizTitleDescription({
    content: questionsContent,
    questions: questionsForAI,
    isExtractMode: data.generationMode === "EXTRACT",
    targetLanguage: data.language === "AUTO" ? "auto" : data.language.toLowerCase(),
    tags: data.tags || [],
  });

  if (titleDescResult.success) {
    finalTitle = titleDescResult.title;
    finalDescription = titleDescResult.description;
  }
}
```

### 5. Improved Fallback System

Enhanced fallback title generation with topic awareness:

- **With filename**: `"Bài kiểm tra: Toán học"` / `"Mathematics Quiz"`
- **With detected topics**: `"Bài kiểm tra: Vật lý"` / `"Physics Quiz"`
- **Generic fallback**: `"Bài kiểm tra được tạo"` / `"Generated Quiz"`

## Benefits

1. **Consistency** - All routes now have the same title generation logic
2. **Intelligence** - Smarter topic detection and language handling
3. **User Experience** - More meaningful, specific titles instead of generic ones
4. **Flexibility** - Works with or without source files/filenames

## Usage Examples

### For AI-Generated Quizzes (isAiGenerated: true)
- ✅ Auto-generates smart titles based on content analysis
- ✅ Detects Vietnamese/English automatically
- ✅ Extracts topics from questions and tags

### For Manual Quizzes (isAiGenerated: false)
- ✅ Uses user-provided title and description as-is
- ✅ No AI processing overhead for manual content

## Technical Details

- **Language Detection**: Unicode Vietnamese character regex + target language hints
- **Topic Extraction**: Question tags → Content keywords → Subject matter analysis
- **API Integration**: Direct OpenRouter API calls for server-side generation
- **Error Handling**: Graceful fallbacks ensure quiz creation never fails due to title generation
