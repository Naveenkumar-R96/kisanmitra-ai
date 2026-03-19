// frontend/src/pages/community/Community.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { communityApi } from '../../api/community.api';
import { useAuthStore } from '../../store/authSlice';
import toast from 'react-hot-toast';

export default function Community() {
  const [newPost, setNewPost] = useState({ title: '', body: '', category: 'question' });
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['community'],
    queryFn: () => communityApi.getPosts({ limit: 20 }),
  });

  const createMutation = useMutation({
    mutationFn: communityApi.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries(['community']);
      setNewPost({ title: '', body: '', category: 'question' });
      setShowForm(false);
      toast.success('पोस्ट बन गई!');
    }
  });

  const likeMutation = useMutation({
    mutationFn: communityApi.toggleLike,
    onSuccess: () => queryClient.invalidateQueries(['community']),
  });

  const posts = data?.data || [];

  const CATEGORY_COLORS = {
    question:      'bg-blue-500/20  text-blue-400',
    tip:           'bg-green-500/20 text-green-400',
    success_story: 'bg-amber-500/20 text-amber-400',
    alert:         'bg-red-500/20   text-red-400',
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">👥 किसान समुदाय</h1>
          <p className="text-gray-400 text-sm">Farmer community Q&A</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 
                     rounded-xl transition-all active:scale-95 text-sm">
          + पोस्ट करें
        </button>
      </motion.div>

      {/* New post form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
          <select value={newPost.category}
            onChange={e => setNewPost({ ...newPost, category: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 
                       text-white mb-3 text-sm focus:outline-none focus:border-green-500">
            <option value="question">❓ सवाल</option>
            <option value="tip">💡 टिप्स</option>
            <option value="success_story">🌟 सफलता की कहानी</option>
            <option value="alert">⚠️ चेतावनी</option>
          </select>
          <input type="text" placeholder="शीर्षक लिखें..."
            value={newPost.title}
            onChange={e => setNewPost({ ...newPost, title: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 
                       text-white placeholder-gray-500 mb-3 focus:outline-none 
                       focus:border-green-500 transition-all" />
          <textarea placeholder="विस्तार से लिखें..."
            value={newPost.body} rows={3}
            onChange={e => setNewPost({ ...newPost, body: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 
                       text-white placeholder-gray-500 resize-none focus:outline-none 
                       focus:border-green-500 transition-all" />
          <div className="flex gap-3 mt-3">
            <button onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-800 text-gray-300 py-2 rounded-xl text-sm font-medium">
              रद्द करें
            </button>
            <button
              onClick={() => createMutation.mutate(newPost)}
              disabled={!newPost.title || !newPost.body || createMutation.isPending}
              className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-green-900 
                         text-white py-2 rounded-xl text-sm font-bold transition-all">
              {createMutation.isPending ? 'भेज रहे हैं...' : 'पोस्ट करें'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="bg-gray-900 rounded-2xl h-32 animate-pulse" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">🌾</p>
          <p>अभी कोई पोस्ट नहीं है। पहले पोस्ट करें!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <motion.div key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-700 rounded-full flex items-center 
                                  justify-center text-white font-bold text-sm">
                    {post.author?.name?.[0] || 'K'}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{post.author?.name}</p>
                    <p className="text-gray-500 text-xs">
                      {post.author?.location?.village} •{' '}
                      {new Date(post.createdAt).toLocaleDateString('hi-IN')}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium 
                                  ${CATEGORY_COLORS[post.category]}`}>
                  {post.category === 'question'      ? '❓' :
                   post.category === 'tip'           ? '💡' :
                   post.category === 'success_story' ? '🌟' : '⚠️'} {post.category}
                </span>
              </div>

              <h3 className="text-white font-bold mb-1">{post.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{post.body}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <button onClick={() => likeMutation.mutate(post._id)}
                  className={`flex items-center gap-1.5 transition-all hover:text-red-400
                    ${post.likes?.includes(user?._id) ? 'text-red-400' : ''}`}>
                  ❤️ {post.likes?.length || 0}
                </button>
                <span>💬 {post.replies?.length || 0} जवाब</span>
                <span>👁️ {post.views || 0}</span>
                {post.isSolved &&
                  <span className="ml-auto text-green-400 font-medium">✅ हल हो गया</span>}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}