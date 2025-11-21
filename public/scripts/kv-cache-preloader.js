import {
    eventSource,
    characters,
    this_chid,
    extension_prompts,
    main_api,
} from '../script.js';
import { oai_settings } from './openai.js';
import { prepareOpenAIMessages } from './openai.js';
import { getWorldInfoPrompt } from './world-info.js';

async function onChatLoaded() {
    console.log('KV Cache Preloader: Chat loaded, preparing request...');

    if (this_chid === undefined || !characters[this_chid]) {
        console.log('KV Cache Preloader: No character selected.');
        return;
    }

    const character = characters[this_chid];
    
    // Use empty messages to get system prompt and character definitions
    const messages = []; 
    
    // Get World Info prompt
    // getWorldInfoPrompt(chat, maxContext, isDryRun, globalScanData)
    const worldInfoResult = await getWorldInfoPrompt(messages, undefined, true, undefined);

    try {
        const [prompt, counts] = await prepareOpenAIMessages({
            name2: character.name,
            charDescription: character.description,
            charPersonality: character.personality,
            scenario: character.scenario,
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
            messages: [],
            messageExamples: [], 
        }, true); // dryRun=true

        if (prompt && Array.isArray(prompt) && prompt.length > 0) {
            // Use configured settings
            const apiUrl = oai_settings.custom_url || 'http://127.0.0.1:13141/v1';
            const model = oai_settings.custom_model || 'Llama-3.2-3B-Instruct-Q4_K_M';

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
    console.log('KV Cache Preloader: Start Init.');
    eventSource.on('chatLoaded', onChatLoaded);
    console.log('KV Cache Preloader: Initialized.');
}
