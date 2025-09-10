import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import {
  AIMessage,
  type BaseMessage,
  HumanMessage,
} from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";
import type { Runnable, RunnableConfig } from "@langchain/core/runnables";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// Use a faster, more cost-effective default model
const DEFAULT_MODEL = "gpt-3.5-turbo";

// Multi-agent workflow interfaces
interface MultiAgentGenerateParams {
  questionHeader: string;
  questionDescription: string;
  apiKey: string;
  fileUrls?: string[];
  siteUrl?: string;
  siteName?: string;
  modelName?: string;
  useMultiAgent?: boolean;
}

// Define state for our multi-agent system
const AgentState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  sender: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "user",
    default: () => "user",
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extractedKeywords: Annotation<Record<string, any>>({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({}),
  }),
  questionContent: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  analysisResult: Annotation<string>({
    reducer: (_, y) => y,
    default: () => "",
  }),
  iterationCount: Annotation<number>({
    reducer: (x, y) => y ?? (x ?? 0) + 1,
    default: () => 0,
  }),
  isCompleted: Annotation<boolean>({
    reducer: (_, y) => y,
    default: () => false,
  }),
});

/**
 * Create an agent from a prompt template
 */
async function createAgentWithPrompt(
  llm: ChatOpenAI,
  systemMessage: string,
): Promise<Runnable> {
  const prompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(systemMessage),
    new MessagesPlaceholder("messages"),
  ]);

  return prompt.pipe(llm);
}

async function runAgentNode(props: {
  state: typeof AgentState.State;
  agent: Runnable;
  name: string;
  config?: RunnableConfig;
}) {
  const { state, agent, name, config } = props;

  console.log(`🤖 Agent Running: ${name}`);

  const result = await agent.invoke(state, config);
  const aiMessage = new AIMessage({ content: result.content, name: name });

  console.log(`✅ Agent Completed: ${name}`);

  return {
    messages: [aiMessage],
    sender: name,
  };
}

// Create a multi-agent workflow for question generation
export async function createMultiAgentWorkflow(
  apiKey: string,
  options?: {
    siteUrl?: string;
    siteName?: string;
    modelName?: string;
  },
) {
  const llm = new ChatOpenAI({
    modelName: options?.modelName || DEFAULT_MODEL,
    apiKey,
    temperature: 0.6,
  });

  // Create agents with appropriate system prompts
  const extractorAgent = await createAgentWithPrompt(
    llm,
    `You are the Extractor Agent. Your job is to analyze the input text and extract key information about the requested question paper.
     Extract the following information:
     1. Exam Type (mid-term, quiz, final, etc.)
     2. Total Marks
     3. Question Difficulty Levels (easy, hard, conceptual, etc.)
     4. Question Types (MCQ, true-false, short theory, long theory)
     5. Subject Areas or Topics

     Format your response as a structured JSON object with these keys. Be specific and detailed in your extraction.
     DO NOT make up information that isn't in the input text. If information is missing, use reasonable defaults based on the available context.`,
  );

  const questionCreatorAgent = await createAgentWithPrompt(
    llm,
    `You are the Question Creator Agent. Your job is to create EXACTLY the requested number of high-quality questions.

     CRITICAL REQUIREMENTS:
     - Generate EXACTLY the number of questions specified in the requirements
     - Each multiple choice question must have EXACTLY 4 options (A, B, C, D)
     - Only ONE option should be marked as correct per question
     - Questions must be clear, specific, and relevant to the content provided
     - For MCQs: Include 4 options with one correct answer
     - For True/False: Create unambiguous statements
     - For Short Theory: Create questions that require brief explanations
     - For Long Theory: Create questions that require in-depth analysis

     Match the difficulty level specified in the requirements. If multiple question types are requested, create a balanced mix.
     Base all questions ONLY on the content provided to ensure they are answerable from the material.

     IMPORTANT: Return your response as a valid JSON array with EXACTLY the requested number of question objects:
     [
       {
         "id": "uuid-v4-format-id",
         "question": "Your question text?",
         "type": "MULTIPLE_CHOICE",
         "difficulty": "EASY|MEDIUM|HARD",
         "points": 1,
         "explanation": "Explanation for correct answer",
         "answers": [
           {"id": "uuid-v4-format-id", "text": "Option A", "isCorrect": false, "order_index": 0},
           {"id": "uuid-v4-format-id", "text": "Option B", "isCorrect": true, "order_index": 1},
           {"id": "uuid-v4-format-id", "text": "Option C", "isCorrect": false, "order_index": 2},
           {"id": "uuid-v4-format-id", "text": "Option D", "isCorrect": false, "order_index": 3}
         ]
       }
     ]

     Return ONLY the JSON array, no other text.`,
  );

  const questionAnalysisAgent = await createAgentWithPrompt(
    llm,
    `You are the Question Analysis Agent. Your job is to analyze questions for quality, clarity, and alignment with requirements.
     Evaluate the questions based on:
     1. Clarity: Are questions clear and unambiguous?
     2. Relevance: Do questions align with the content provided?
     3. Difficulty: Do questions match the requested difficulty level?
     4. Coverage: Do questions adequately cover the required topics?
     5. Correctness: Are the provided answers correct?

     Provide specific feedback on each question and suggest improvements where needed.
     Be constructive and detailed in your analysis.

     IMPORTANT: Return your improved questions as a valid JSON array following the same format as the Question Creator.`,
  );

  const deciderAgent = await createAgentWithPrompt(
    llm,
    `You are the Decider Agent. Your job is to determine if the question set meets all requirements or needs further refinement.
     Based on the analysis provided, make a clear binary decision:

     If the questions meet all requirements and are ready for formatting, respond ONLY with: "PERFECT"

     If the questions need ANY improvement, respond ONLY with: "NOT PERFECT"

     Be thorough in your assessment and consider all aspects of the requirements.
     Your decision must be binary - either the questions are completely ready or they need more work.`,
  );

  const formatterAgent = await createAgentWithPrompt(
    llm,
    `You are the Question Formatter Agent. Your job is to format the finalized questions into a JSON array format suitable for the quiz system.

     IMPORTANT: Return ONLY a valid JSON array of question objects. Each question must have:
     - id: unique identifier
     - question: the question text
     - type: question type (MULTIPLE_CHOICE, TRUE_FALSE, FILL_BLANK, FREE_RESPONSE)
     - difficulty: difficulty level (EASY, MEDIUM, HARD)
     - points: point value (default 1)
     - answers: array of answer objects with id, text, isCorrect, and order_index fields
     - explanation: explanation text

     Ensure the JSON is valid and properly formatted. Do not include any other text.`,
  );

  // Define agent nodes
  async function extractorNode(
    state: typeof AgentState.State,
    config?: RunnableConfig,
  ) {
    console.log("🔍 Starting Extractor Agent...");
    const messages = [...state.messages];
    const userMessage = messages.find(
      (msg) => msg instanceof HumanMessage,
    ) as HumanMessage;

    if (userMessage) {
      const content = userMessage.content as string;
      const headerDescriptionPart = content.split(
        "Content to generate questions from:",
      )[0];

      const newMessage = new HumanMessage({
        content: `Extract key information from this request: ${headerDescriptionPart}`,
      });

      const extractorState = {
        ...state,
        messages: [newMessage],
      };

      return runAgentNode({
        state: extractorState,
        agent: extractorAgent,
        name: "Extractor",
        config,
      });
    }

    return runAgentNode({
      state,
      agent: extractorAgent,
      name: "Extractor",
      config,
    });
  }

  async function questionCreatorNode(
    state: typeof AgentState.State,
    config?: RunnableConfig,
  ) {
    console.log("📝 Starting Question Creator Agent...");
    const messages = [...state.messages];
    const extractorMessage = messages.find((msg) => msg.name === "Extractor");
    const originalMessage = messages.find(
      (msg) => msg instanceof HumanMessage,
    ) as HumanMessage;

    if (extractorMessage && originalMessage) {
      const extractorContent = extractorMessage.content as string;
      console.log(
        "📋 Using extracted information:",
        `${extractorContent.substring(0, 100)}...`,
      );

      messages.push(
        new HumanMessage({
          content: `Create questions based on these requirements:
1. Use the extracted keywords and requirements: ${extractorContent}
2. Original request: ${originalMessage.content}
Create appropriate questions using the provided content. Return as JSON array.`,
        }),
      );
    }

    const updatedState = { ...state, messages };

    const result = await runAgentNode({
      state: updatedState,
      agent: questionCreatorAgent,
      name: "QuestionCreator",
      config,
    });

    return {
      ...result,
      questionContent: result.messages[0].content,
    };
  }

  async function questionAnalysisNode(
    state: typeof AgentState.State,
    config?: RunnableConfig,
  ) {
    console.log("🔍 Starting Question Analysis Agent...");
    const messages = [...state.messages];
    const creatorMessage = messages.find(
      (msg) => msg.name === "QuestionCreator",
    );
    const extractorMessage = messages.find((msg) => msg.name === "Extractor");

    if (creatorMessage && extractorMessage) {
      console.log(
        "📋 Analyzing and modifying questions created by Question Creator",
      );
      messages.push(
        new HumanMessage({
          content: `Analyze and improve these questions:
1. Questions to analyze: ${creatorMessage.content}
2. Requirements from extraction: ${extractorMessage.content}
3. Focus on checking and modifying questions based on difficulty levels (hard/easy/conceptual)
4. Ensure questions meet all requirements and are clear and well-structured
5. Return improved questions as JSON array`,
        }),
      );
    }

    const updatedState = { ...state, messages };

    const result = await runAgentNode({
      state: updatedState,
      agent: questionAnalysisAgent,
      name: "QuestionAnalysis",
      config,
    });

    return {
      ...result,
      analysisResult: result.messages[0].content,
    };
  }

  async function deciderNode(
    state: typeof AgentState.State,
    config?: RunnableConfig,
  ) {
    console.log("🧠 Starting Decider Agent...");
    const messages = [...state.messages];
    const analysisMessage = messages.find(
      (msg) => msg.name === "QuestionAnalysis",
    );
    const creatorMessage = messages.find(
      (msg) => msg.name === "QuestionCreator",
    );

    if (analysisMessage && creatorMessage) {
      console.log("📋 Making decision based on question analysis and creation");
      messages.push(
        new HumanMessage({
          content: `Make a binary decision:
1. Original questions: ${creatorMessage.content}
2. Analysis and modifications: ${analysisMessage.content}

If the questions meet ALL requirements, respond ONLY with: "PERFECT"
If the questions need ANY improvement, respond ONLY with: "NOT PERFECT"
Be clear and concise in your decision.`,
        }),
      );
    }

    const updatedState = { ...state, messages };

    return runAgentNode({
      state: updatedState,
      agent: deciderAgent,
      name: "Decider",
      config,
    });
  }

  async function formatterNode(
    state: typeof AgentState.State,
    config?: RunnableConfig,
  ) {
    console.log("📄 Starting Formatter Agent...");
    const messages = [...state.messages];
    const creatorMessage = messages.find(
      (msg) => msg.name === "QuestionCreator",
    );
    const analysisMessage = messages.find(
      (msg) => msg.name === "QuestionAnalysis",
    );

    if (creatorMessage && analysisMessage) {
      console.log("📋 Formatting final quiz questions");
      messages.push(
        new HumanMessage({
          content: `Format these questions into the final JSON array:
1. Original questions: ${creatorMessage.content}
2. Analysis and modifications: ${analysisMessage.content}

Create a well-structured JSON array that incorporates all the feedback and improvements.
Return ONLY the JSON array, no other text.`,
        }),
      );
    }

    const updatedState = { ...state, messages };

    const result = await runAgentNode({
      state: updatedState,
      agent: formatterAgent,
      name: "Formatter",
      config,
    });

    console.log("🎉 Question generation process completed!");
    return {
      ...result,
      isCompleted: true,
    };
  }

  // Router function to determine the next step
  function mainRouter(state: typeof AgentState.State) {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1] as AIMessage;
    const iterationCount = state.iterationCount || 0;

    if (lastMessage.name === "Extractor") {
      console.log("🔄 Router: Extractor → Question Creator");
      return "to_question_creator";
    }

    if (lastMessage.name === "QuestionCreator") {
      console.log("🔄 Router: Question Creator → Question Analysis");
      return "to_question_analysis";
    }

    if (lastMessage.name === "QuestionAnalysis") {
      console.log("🔄 Router: Question Analysis → Decider");
      return "to_decider";
    }

    if (lastMessage.name === "Decider") {
      const content = lastMessage.content as string;

      if (content.includes("NOT PERFECT") && iterationCount < 1) {
        console.log(
          "🔄 Router: Decider → Question Creator (NOT PERFECT, iteration 1)",
        );
        return "to_question_creator";
      }

      console.log(
        `🔄 Router: Decider → Formatter (${content.includes("PERFECT") ? "PERFECT" : "MAX ITERATIONS REACHED"})`,
      );
      return "to_formatter";
    }

    if (lastMessage.name === "Formatter") {
      console.log("🔄 Router: Formatter → End");
      return "end";
    }

    console.log("🔄 Router: Continue with current agent");
    return "continue";
  }

  // Create the graph
  const workflow = new StateGraph(AgentState)
    .addNode("Extractor", extractorNode)
    .addNode("QuestionCreator", questionCreatorNode)
    .addNode("QuestionAnalysis", questionAnalysisNode)
    .addNode("Decider", deciderNode)
    .addNode("Formatter", formatterNode);

  // Add edges for the main workflow
  workflow.addConditionalEdges("Extractor", mainRouter, {
    to_question_creator: "QuestionCreator",
    continue: "Extractor",
  });

  workflow.addConditionalEdges("QuestionCreator", mainRouter, {
    to_question_analysis: "QuestionAnalysis",
    continue: "QuestionCreator",
  });

  workflow.addConditionalEdges("QuestionAnalysis", mainRouter, {
    to_decider: "Decider",
    continue: "QuestionAnalysis",
  });

  workflow.addConditionalEdges("Decider", mainRouter, {
    to_formatter: "Formatter",
    to_question_creator: "QuestionCreator",
    continue: "Decider",
  });

  workflow.addEdge("Formatter", END);
  workflow.addEdge(START, "Extractor");

  return workflow.compile();
}

// Multi-agent question generation with streaming support
export async function generateQuestionsWithMultiAgent({
  questionHeader,
  questionDescription,
  apiKey,
  fileUrls = [],
  siteUrl,
  siteName,
  modelName = DEFAULT_MODEL,
}: MultiAgentGenerateParams) {
  console.log("🚀 Starting multi-agent question generation process");

  const processPDFUrls = async (urls: string[]) => {
    try {
      const allDocs = [];

      for (const url of urls) {
        try {
          console.log(`Processing PDF URL: ${url}`);
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(
              `Failed to fetch PDF: ${response.status} ${response.statusText}`,
            );
          }

          const arrayBuffer = await response.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const loader = new WebPDFLoader(
            new Blob([uint8Array], { type: "application/pdf" }),
          );

          console.log("Loading PDF content with WebPDFLoader...");
          const docs = await loader.load();
          console.log(`Loaded ${docs.length} documents from PDF`);

          allDocs.push(...docs);
          console.log(`Successfully processed PDF from URL: ${url}`);
        } catch (loadError) {
          console.error(`Error processing PDF from URL ${url}:`, loadError);
        }
      }

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 4000,
        chunkOverlap: 200,
      });

      console.log(`Splitting ${allDocs.length} documents from URLs`);
      const splitDocs = await textSplitter.splitDocuments(allDocs);
      console.log(`Split into ${splitDocs.length} chunks`);
      return splitDocs;
    } catch (error) {
      console.error("Error processing PDF URLs:", error);
      throw new Error(
        `Failed to process PDF URLs: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  };

  try {
    console.log("📚 Processing PDF files");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fileDocs: any[] = [];

    if (fileUrls && fileUrls.length > 0) {
      console.log(`Processing ${fileUrls.length} PDF URLs`);
      fileDocs = await processPDFUrls(fileUrls);
    }

    const fileText = fileDocs.map((doc) => doc.pageContent).join("\n\n");
    console.log(`📄 Extracted ${fileText.length} characters of text from PDFs`);

    const inputPrompt = `
Question Header: ${questionHeader}
Question Description: ${questionDescription}

Content to generate questions from:
${fileText}
    `;

    console.log("🔄 Creating multi-agent workflow");
    const workflow = await createMultiAgentWorkflow(apiKey, {
      siteUrl,
      siteName,
      modelName,
    });

    console.log("🚀 Invoking multi-agent workflow with streaming");

    const initialState = {
      messages: [new HumanMessage(inputPrompt)],
      iterationCount: 0,
    };
    const config = {
      configurable: {
        thread_id: "stream_events",
      },
    };

    console.log("📊 Streaming mode enabled");

    return {
      success: true,
      stream: await workflow.stream(initialState, config),
      streamEvents: true,
    };
  } catch (error) {
    console.error("❌ Multi-agent Generation Error:", error);
    return {
      success: false,
      error: `Failed to generate questions with multi-agent: ${
        error instanceof Error ? error.message : String(error)
      }`,
      streamEvents: false,
    };
  }
}
