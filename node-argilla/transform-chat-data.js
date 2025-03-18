/**
 * Utility functions to transform AnswerAI chat data into Argilla format
 */

/**
 * Extract and format agent reasoning from the chat data
 * @param {Object} chat - Chat message object
 * @returns {string} - Formatted agent reasoning text
 */
function formatAgentReasoning(chat) {
    if (!chat.agentReasoning || !Array.isArray(chat.agentReasoning) || chat.agentReasoning.length === 0) {
        return "No reasoning data available";
    }

    return chat.agentReasoning.map(agent => {
        let reasoning = `Agent: ${agent.agentName || 'Unnamed'}\n`;

        // Add messages
        if (agent.messages && agent.messages.length > 0) {
            reasoning += `\nMessages:\n${agent.messages.join('\n')}\n`;
        }

        // Add state if available
        if (agent.state && Object.keys(agent.state).length > 0) {
            reasoning += `\nState: ${JSON.stringify(agent.state, null, 2)}\n`;
        }

        return reasoning;
    }).join('\n\n');
}

/**
 * Extract and format used tools from the chat data
 * @param {Object} chat - Chat message object
 * @returns {string} - Formatted tools text
 */
function formatUsedTools(chat) {
    if (!chat.usedTools || !Array.isArray(chat.usedTools) || chat.usedTools.length === 0) {
        return "No tools used";
    }

    return chat.usedTools.map(tool => {
        let toolInfo = `Tool: ${tool.tool}\n`;

        if (tool.toolInput) {
            toolInfo += `Input: ${JSON.stringify(tool.toolInput, null, 2)}\n`;
        }

        if (tool.toolOutput) {
            toolInfo += `Output: ${typeof tool.toolOutput === 'string' ? tool.toolOutput : JSON.stringify(tool.toolOutput, null, 2)}\n`;
        }

        return toolInfo;
    }).join('\n\n');
}

/**
 * Extract and format source documents from the chat data
 * @param {Object} chat - Chat message object
 * @returns {string} - Formatted source documents text
 */
function formatSourceDocuments(chat) {
    if (!chat.sourceDocuments || !Array.isArray(chat.sourceDocuments) || chat.sourceDocuments.length === 0) {
        return "No source documents referenced";
    }

    return chat.sourceDocuments.map((doc, index) => {
        let docInfo = `Document ${index + 1}:\n`;

        if (doc.metadata) {
            docInfo += `Metadata: ${JSON.stringify(doc.metadata, null, 2)}\n`;
        }

        if (doc.pageContent) {
            docInfo += `Content: ${doc.pageContent}\n`;
        }

        return docInfo;
    }).join('\n\n');
}

/**
 * Transform AnswerAI chat messages into Argilla records format
 * @param {Array} chatMessages - Array of chat message objects
 * @returns {Array} - Array of formatted records for Argilla
 */
function transformChatToArgillaRecords(chatMessages) {
    if (!Array.isArray(chatMessages) || chatMessages.length === 0) {
        console.error("Invalid or empty chat messages array");
        return [];
    }

    return chatMessages.map(chat => {
        // Extract user query (this might need adjustment based on your actual data structure)
        const userQuery = chat.role === 'userMessage' ? chat.content : "No user query available";

        // Extract AI response
        const aiResponse = chat.role === 'apiMessage' ? chat.content : "No AI response available";

        // Format other fields
        const agentReasoning = formatAgentReasoning(chat);
        const usedTools = formatUsedTools(chat);
        const sourceDocuments = formatSourceDocuments(chat);

        // Create and return the record
        return {
            fields: {
                user_query: userQuery,
                ai_response: aiResponse,
                agent_reasoning: agentReasoning,
                used_tools: usedTools,
                source_documents: sourceDocuments
            },
            metadata: {
                chat_id: chat.chatId || "unknown",
                created_date: chat.createdDate || new Date().toISOString(),
                session_id: chat.sessionId || "unknown"
            }
        };
    });
}

module.exports = {
    transformChatToArgillaRecords,
    formatAgentReasoning,
    formatUsedTools,
    formatSourceDocuments
}; 