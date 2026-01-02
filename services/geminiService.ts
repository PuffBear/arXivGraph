
import { GoogleGenAI, Type } from "@google/genai";
import { GraphData, ClusterInsight, Paper } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRelatedWorkGraph = async (topic: string): Promise<GraphData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Search for real, highly-cited research papers related to: "${topic}". 
    Create a graph of exactly 20 real papers. 
    For each paper:
    1. Find its actual ArXiv ID (format: YYMM.NNNNN).
    2. Write a concise 1-2 sentence statement ("relevanceStatement") explaining exactly how this specific paper contributes to or connects with the user's query topic: "${topic}".
    
    Assign each paper to one of 3 distinct clusters (clusterId 0, 1, or 2) based on sub-topics.
    Identify 2-3 "bridge papers" that connect different clusters.
    Generate links based on real citations or high conceptual similarity.
    Return the result in the specified JSON format.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                authors: { type: Type.ARRAY, items: { type: Type.STRING } },
                year: { type: Type.INTEGER },
                abstract: { type: Type.STRING },
                clusterId: { type: Type.INTEGER },
                arxivId: { type: Type.STRING },
                relevanceStatement: { type: Type.STRING },
                isBridge: { type: Type.BOOLEAN }
              },
              required: ["id", "title", "authors", "year", "abstract", "clusterId", "arxivId", "relevanceStatement"]
            }
          },
          links: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                source: { type: Type.STRING },
                target: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['citation', 'similarity', 'dataset'] }
              },
              required: ["source", "target", "type"]
            }
          }
        },
        required: ["nodes", "links"]
      }
    }
  });

  try {
    const text = response.text;
    const cleanJson = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Invalid graph data format.");
  }
};

export const generateClusterInsight = async (papers: Paper[]): Promise<ClusterInsight> => {
  const papersText = papers.map(p => `- ${p.title} (${p.year}) by ${p.authors.join(", ")}`).join("\n");
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Based on the following real papers in a specific research cluster, suggest a professional subsection title for a Related Work section and write a 2-paragraph narrative connecting their contributions and identifying trends.
    
    Papers:
    ${papersText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          narrative: { type: Type.STRING }
        },
        required: ["title", "narrative"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse Gemini insight response", e);
    throw new Error("Invalid insight format");
  }
};
