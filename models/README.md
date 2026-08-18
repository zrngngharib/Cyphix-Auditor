# Local Offline GGUF Models Directory (node-llama-cpp)

Place your `.gguf` model files in this folder to run 100% offline, private, air-gapped codebase audits.

### Supported Models:
- **Llama 3.2 / 3.3 GGUF** (e.g. `llama-3.2-3b-instruct-q4_k_m.gguf`)
- **DeepSeek-R1 Distill GGUF** (e.g. `DeepSeek-R1-Distill-Qwen-7B-Q4_K_M.gguf`)
- **Qwen 2.5 Coder GGUF** (e.g. `qwen2.5-coder-7b-instruct-q4_k_m.gguf`)
- **Gemma 2 / Mistral GGUF**

### How it works:
1. Download any GGUF model from [HuggingFace](https://huggingface.co/models?search=gguf).
2. Place the `.gguf` file into this `./models/` folder (or name it `model.gguf`).
3. In the UI, switch the AI Provider to **Local Offline LLM (node-llama-cpp)**.
4. Click **Execute 7-Dimensional Codebase Audit** - all evaluation runs 100% locally on your machine with zero external network requests!
