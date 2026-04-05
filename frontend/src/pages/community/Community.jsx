import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { communityApi } from '../../api/community.api';
import { useAuthStore } from '../../store/authSlice';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function Community() {
  const { t, i18n } = useTranslation();
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
      toast.success(t('postSuccess'));
    }
  });

  const likeMutation = useMutation({
    mutationFn: communityApi.toggleLike,
    onSuccess: () => queryClient.invalidateQueries(['community']),
  });

  const posts = data?.data || [];

  const CATEGORY_COLORS = {
    question: 'bg-blue-500/20 text-blue-400',
    tip: 'bg-green-500/20 text-green-400',
    success_story: 'bg-amber-500/20 text-amber-400',
    alert: 'bg-red-500/20 text-red-400',
  };

  const CATEGORY_LABELS = {
    question: t('question'),
    tip: t('tip'),
    success_story: t('successStory'),
    alert: t('alert'),
  };

  return (
    <div className="min-h-screen bg-gray-950 p-4 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-2xl font-bold">👥 {t('kisanCommunity')}</h1>
          <p className="text-gray-400 text-sm">{t('communitySubtitle')}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded-xl text-sm">
          {t('createPost')}
        </button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">

          <select value={newPost.category}
            onChange={e => setNewPost({ ...newPost, category: e.target.value })}
            className="w-full bg-gray-800 rounded-xl px-4 py-2 text-white mb-3">
            <option value="question">❓ {t('question')}</option>
            <option value="tip">💡 {t('tip')}</option>
            <option value="success_story">🌟 {t('successStory')}</option>
            <option value="alert">⚠️ {t('alert')}</option>
          </select>

          <input
            type="text"
            placeholder={t('writeTitle')}
            value={newPost.title}
            onChange={e => setNewPost({ ...newPost, title: e.target.value })}
            className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white mb-3"
          />

          <textarea
            placeholder={t('writeDetails')}
            value={newPost.body}
            rows={3}
            onChange={e => setNewPost({ ...newPost, body: e.target.value })}
            className="w-full bg-gray-800 rounded-xl px-4 py-3 text-white"
          />

          <div className="flex gap-3 mt-3">
            <button onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-800 text-gray-300 py-2 rounded-xl">
              {t('cancel')}
            </button>

            <button
              onClick={() => createMutation.mutate(newPost)}
              disabled={!newPost.title || !newPost.body}
              className="flex-1 bg-green-600 text-white py-2 rounded-xl">
              {createMutation.isPending ? t('posting') : t('postBtn')}
            </button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div>Loading...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">🌾</p>
          <p>{t('noPostsYet')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post._id} className="bg-gray-900 rounded-2xl p-5">

              <div className="flex justify-between mb-2">
                <p className="text-white">{post.author?.name}</p>
                <span className={`${CATEGORY_COLORS[post.category]} px-2 py-1 rounded`}>
                  {CATEGORY_LABELS[post.category]}
                </span>
              </div>

              <h3 className="text-white font-bold">{post.title}</h3>
              <p className="text-gray-400">{post.body}</p>

              <div className="flex gap-4 text-gray-500 mt-3">
                <button onClick={() => likeMutation.mutate(post._id)}>
                  ❤️ {post.likes?.length || 0}
                </button>

                <span>💬 {post.replies?.length || 0} {t('replies')}</span>

                {post.isSolved && (
                  <span className="text-green-400">✅ {t('solved')}</span>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}