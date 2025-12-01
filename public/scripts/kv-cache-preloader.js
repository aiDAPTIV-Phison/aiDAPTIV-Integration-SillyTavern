import {
    eventSource,
    characters,
    this_chid,
    extension_prompts,
    main_api,
    chat,
    parseMesExamples,
    baseChatReplace,
    name1,
    name2,
} from '../script.js';
import { 
    oai_settings,
    prepareOpenAIMessages,
    setOpenAIMessages,
    setOpenAIMessageExamples,
} from './openai.js';
import { getWorldInfoPrompt } from './world-info.js';

async function onChatLoaded() {
    console.log('KV Cache Preloader: Chat loaded, preparing request...');

    if (this_chid === undefined || !characters[this_chid]) {
        console.log('KV Cache Preloader: No character selected.');
        return;
    }

    const character = characters[this_chid];

    console.log(`KV Cache Preloader: Processing chat for ${character.name}. Chat length: ${chat?.length}`);
    if (chat && chat.length > 0) {
        console.log(`KV Cache Preloader: First message:`, chat[0]);
        console.log(`KV Cache Preloader: Last message:`, chat[chat.length - 1]);
    }

    const oaiMessages = setOpenAIMessages(chat);
    console.log(`KV Cache Preloader: Generated ${oaiMessages?.length} OpenAI messages.`);
    
    const mesExamplesArray = parseMesExamples(character.mes_example, true);
    const oaiMessageExamples = setOpenAIMessageExamples(mesExamplesArray);

    const charDescription = baseChatReplace(character.description?.trim(), name1, name2);
    const charPersonality = baseChatReplace(character.personality?.trim(), name1, name2);
    const scenario = baseChatReplace(character.scenario?.trim(), name1, name2);
    

    const worldInfoResult = await getWorldInfoPrompt([], undefined, true, undefined);

    try {
        const safeOaiMessages = Array.isArray(oaiMessages) ? oaiMessages : [];
        const safeOaiMessageExamples = Array.isArray(oaiMessageExamples) ? oaiMessageExamples : [];

        const [prompt, counts] = await prepareOpenAIMessages({
            name2: character.name,
            charDescription: charDescription,
            charPersonality: charPersonality,
            scenario: scenario,
            worldInfoBefore: worldInfoResult.worldInfoBefore,
            worldInfoAfter: worldInfoResult.worldInfoAfter, 
            extensionPrompts: extension_prompts,
            bias: null,
            type: 'chat',
            quietPrompt: '',
            quietImage: null,
            cyclePrompt: '',
            systemPromptOverride: '',
            jailbreakPromptOverride: '',
            messages: safeOaiMessages,
            messageExamples: safeOaiMessageExamples, 
        }, true);

        if (prompt && Array.isArray(prompt) && prompt.length > 0) {
            // Use configured settings
            const apiUrl = oai_settings.custom_url || oai_settings.reverse_proxy || 'http://127.0.0.1:13141/v1';
            const model = oai_settings.custom_model || 'Meta-Llama-3.1-8B-Instruct-Q4_K_M';

            // Ensure URL ends with /chat/completions
            let fetchUrl = apiUrl;
            if (!fetchUrl.endsWith('/chat/completions')) {
                if (!fetchUrl.endsWith('/')) {
                    fetchUrl += '/';
                }
                fetchUrl += 'chat/completions';
            }

            console.log(`KV Cache Preloader: Sending request to ${fetchUrl}...`);
            
            // Construct the request body
            const requestBody = {
                messages: prompt,
                max_tokens: 1,
                model: model,
            };

            const response = await fetch(fetchUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('KV Cache Preloader: Request sent successfully.', data);
            } else {
                console.error('KV Cache Preloader: Request failed.', response.status, response.statusText);
            }
        } else {
            console.log('KV Cache Preloader: No prompt generated.');
        }

    } catch (error) {
        console.error('KV Cache Preloader: Error preparing or sending request', error);
    }
}

// Register the event listener
export function initKvCachePreloader() {
    console.log(`KV Cache Preloader: Start Init (${new Date().toISOString()})`);
    eventSource.on('chatLoaded', onChatLoaded);
    console.log('KV Cache Preloader: Initialized.');

    if (this_chid !== undefined && characters[this_chid]) {
        console.log('KV Cache Preloader: Character already selected on init, triggering handler manually.');
        onChatLoaded();
    }
}
