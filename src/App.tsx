import { useState } from 'react';
import { Loader2, Sparkles, Image as ImageIcon, Twitter, Instagram, Linkedin, Settings, Copy, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tone = 'Professional' | 'Witty' | 'Urgent' | 'Casual' | 'Inspirational';
type ImageSize = '512px' | '1K' | '2K' | '4K';
type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';

interface PlatformPost {
  text: string;
  imagePrompt: string;
}

interface GeneratedPosts {
  linkedin: PlatformPost;
  twitter: PlatformPost;
  instagram: PlatformPost;
}

export default function App() {
  const [idea, setIdea] = useState('');
  const [tone, setTone] = useState<Tone>('Professional');
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  
  const [aspectRatios, setAspectRatios] = useState<Record<string, AspectRatio>>({
    linkedin: '16:9',
    twitter: '16:9',
    instagram: '4:3',
  });

  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [generatingImages, setGeneratingImages] = useState<Record<string, boolean>>({});
  
  const [posts, setPosts] = useState<GeneratedPosts | null>(null);
  const [images, setImages] = useState<Record<string, string>>({});
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  const handleGenerate = async () => {
    if (!idea.trim()) return;

    setIsGeneratingText(true);
    setPosts(null);
    setImages({});
    
    try {
      const response = await fetch('/api/generate-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, tone }),
      });
      
      if (!response.ok) throw new Error('Failed to generate posts');
      
      const data: GeneratedPosts = await response.json();
      setPosts(data);
      
      // Kick off image generation for all three
      generateImage('linkedin', data.linkedin.imagePrompt);
      generateImage('twitter', data.twitter.imagePrompt);
      generateImage('instagram', data.instagram.imagePrompt);
      
    } catch (error) {
      console.error(error);
      alert('Error generating text. Please check the console.');
    } finally {
      setIsGeneratingText(false);
    }
  };

  const generateImage = async (platform: keyof GeneratedPosts, prompt: string) => {
    setGeneratingImages(prev => ({ ...prev, [platform]: true }));
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio: aspectRatios[platform],
          imageSize,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to generate image');
      const data = await response.json();
      
      setImages(prev => ({ ...prev, [platform]: data.image }));
    } catch (error) {
      console.error(`Error generating image for ${platform}:`, error);
    } finally {
      setGeneratingImages(prev => ({ ...prev, [platform]: false }));
    }
  };

  const copyToClipboard = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates(prev => ({ ...prev, [platform]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [platform]: false }));
    }, 2000);
  };

  const updateAspectRatio = (platform: string, ratio: AspectRatio) => {
    setAspectRatios(prev => ({ ...prev, [platform]: ratio }));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-6 md:p-12 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-100 text-indigo-700 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
            OmniSocial Creator
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Turn one idea into tailored, ready-to-publish posts for LinkedIn, Twitter, and Instagram with perfectly sized AI visuals.
          </p>
        </header>

        {/* Input Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 md:p-8 space-y-8">
            <div className="space-y-3">
              <label htmlFor="idea" className="block text-sm font-medium text-gray-700">What's your idea?</label>
              <textarea
                id="idea"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="E.g., We just launched our new AI-powered code assistant that helps developers write tests 10x faster."
                className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-base"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-gray-900 font-medium pb-2 border-b border-gray-100">
                  <Settings className="w-5 h-5 text-gray-400" />
                  <span>Content Settings</span>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Tone of Voice</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value as Tone)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Witty">Witty</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Casual">Casual</option>
                    <option value="Inspirational">Inspirational</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-2 text-gray-900 font-medium pb-2 border-b border-gray-100">
                  <ImageIcon className="w-5 h-5 text-gray-400" />
                  <span>Image Settings</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Quality / Size</label>
                    <select
                      value={imageSize}
                      onChange={(e) => setImageSize(e.target.value as ImageSize)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="1K">1K (Standard)</option>
                      <option value="2K">2K (High)</option>
                      <option value="4K">4K (Ultra)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Aspect Ratios</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs text-gray-500 mb-1 block">LinkedIn</span>
                      <select
                        value={aspectRatios.linkedin}
                        onChange={(e) => updateAspectRatio('linkedin', e.target.value as AspectRatio)}
                        className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {['16:9', '4:3', '1:1'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 mb-1 block">Twitter</span>
                      <select
                        value={aspectRatios.twitter}
                        onChange={(e) => updateAspectRatio('twitter', e.target.value as AspectRatio)}
                        className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {['16:9', '1:1', '2:3'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 mb-1 block">Instagram</span>
                      <select
                        value={aspectRatios.instagram}
                        onChange={(e) => updateAspectRatio('instagram', e.target.value as AspectRatio)}
                        className="w-full p-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {['4:3', '1:1', '9:16', '3:4'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 md:px-8 border-t border-gray-200">
            <button
              onClick={handleGenerate}
              disabled={isGeneratingText || !idea.trim()}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              {isGeneratingText ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Drafting Posts...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Generate Content</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {posts && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <PostCard
                platform="linkedin"
                icon={<Linkedin className="w-5 h-5" />}
                colorClass="text-blue-700 bg-blue-50 border-blue-200"
                post={posts.linkedin}
                imageUrl={images.linkedin}
                isGeneratingImage={generatingImages.linkedin}
                onCopy={() => copyToClipboard(posts.linkedin.text, 'linkedin')}
                hasCopied={copiedStates.linkedin}
              />
              <PostCard
                platform="twitter"
                icon={<Twitter className="w-5 h-5" />}
                colorClass="text-sky-600 bg-sky-50 border-sky-200"
                post={posts.twitter}
                imageUrl={images.twitter}
                isGeneratingImage={generatingImages.twitter}
                onCopy={() => copyToClipboard(posts.twitter.text, 'twitter')}
                hasCopied={copiedStates.twitter}
              />
              <PostCard
                platform="instagram"
                icon={<Instagram className="w-5 h-5" />}
                colorClass="text-pink-600 bg-pink-50 border-pink-200"
                post={posts.instagram}
                imageUrl={images.instagram}
                isGeneratingImage={generatingImages.instagram}
                onCopy={() => copyToClipboard(posts.instagram.text, 'instagram')}
                hasCopied={copiedStates.instagram}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PostCard({ 
  platform, 
  icon, 
  colorClass, 
  post, 
  imageUrl, 
  isGeneratingImage, 
  onCopy, 
  hasCopied 
}: { 
  platform: string; 
  icon: React.ReactNode; 
  colorClass: string; 
  post: PlatformPost;
  imageUrl?: string;
  isGeneratingImage: boolean;
  onCopy: () => void;
  hasCopied: boolean;
}) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <div className={`px-5 py-4 border-b flex items-center justify-between ${colorClass.split(' ')[1]} ${colorClass.split(' ')[2]}`}>
        <div className={`flex items-center space-x-2 font-medium capitalize ${colorClass.split(' ')[0]}`}>
          {icon}
          <span>{platform}</span>
        </div>
        <button
          onClick={onCopy}
          className="text-gray-500 hover:text-gray-900 transition-colors p-1.5 rounded-lg hover:bg-white/50"
          title="Copy text"
        >
          {hasCopied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      
      <div className="p-5 flex-1 flex flex-col space-y-5">
        <div className="flex-1">
          <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
            {post.text}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center justify-between">
            <span>Generated Visual</span>
            {isGeneratingImage && <span className="text-indigo-600 flex items-center"><Loader2 className="w-3 h-3 animate-spin mr-1"/> Rendering...</span>}
          </div>
          
          <div className="bg-gray-100 rounded-xl overflow-hidden aspect-video flex items-center justify-center relative">
            {imageUrl ? (
              <img src={imageUrl} alt={`Generated for ${platform}`} className="w-full h-full object-cover" />
            ) : isGeneratingImage ? (
              <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-300" />
              </div>
            ) : (
              <div className="text-center p-4 text-gray-400">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <span className="text-xs block">Image unavailable</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

