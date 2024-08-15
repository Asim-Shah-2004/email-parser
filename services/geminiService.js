import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {modelType,systemInstruction} from "../config/index.js"

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const gemini = async(prompt)=>{
    const model = genAI.getGenerativeModel({
        model: modelType,
        systemInstruction: systemInstruction,
    });
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();   
    return text
}

export default gemini