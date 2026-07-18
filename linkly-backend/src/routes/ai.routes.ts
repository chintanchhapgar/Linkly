import { Router } from 'express';
import OpenAI from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper: Fetch page title & description
async function getUrlMetadata(url: string) {
  try {
    const { data } = await axios.get(url, { 
      timeout: 5000,
      headers: { 'User-Agent': 'Mozilla/5.0' } 
    });
    const $ = cheerio.load(data);
    const title = $('title').text() || $('meta[property="og:title"]').attr('content');
    const description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content');
    
    return { title, description };
  } catch (error) {
    return { title: null, description: null };
  }
}

router.post('/generate', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { url } = req.body;

    if (!url) return res.status(400).json({ error: 'URL is required' });

    // 1. Get real context from the website
    const metadata = await getUrlMetadata(url);

    // 2. Prompt OpenAI for suggestions
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates professional link titles and short, catchy, lowercase URL slugs. Respond only in JSON format."
        },
        {
          role: "user",
          content: `Generate a title and a short slug (3-10 chars) for this URL: ${url}. 
          Web Page Context: Title: ${metadata.title}, Description: ${metadata.description}.
          Return JSON format: {"title": "string", "slug": "string"}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    res.json({
      title: result.title || metadata.title || 'New Link',
      slug: result.slug?.toLowerCase().replace(/\s+/g, '-') || ''
    });
  } catch (error: any) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

export default router;