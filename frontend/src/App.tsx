import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';

const Home = lazy(() => import('./routes/Home'));
const Login = lazy(() => import('./routes/Login'));
const Register = lazy(() => import('./routes/Register'));
const Forum = lazy(() => import('./routes/Forum'));
const PostDetail = lazy(() => import('./routes/PostDetail'));
const NewPost = lazy(() => import('./routes/NewPost'));
const KnowledgeBase = lazy(() => import('./routes/KnowledgeBase'));
const ResourceDetail = lazy(() => import('./routes/ResourceDetail'));
const CheckIn = lazy(() => import('./routes/CheckIn'));
const Groups = lazy(() => import('./routes/Groups'));
const InterestCircles = lazy(() => import('./routes/InterestCircles'));
const CircleDetail = lazy(() => import('./routes/CircleDetail'));
const Invite = lazy(() => import('./routes/Invite'));
const Profile = lazy(() => import('./routes/Profile'));

function PageLoading() {
  return (
    <div className="flex items-center justify-center py-24 text-gray-400">
      <div className="w-5 h-5 border-2 border-peach-200 border-t-peach-500 rounded-full animate-spin" />
      <span className="ml-3 text-sm">加载中…</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Suspense fallback={<PageLoading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forum" element={<Forum />} />
              <Route path="/forum/new" element={<NewPost />} />
              <Route path="/forum/:id" element={<PostDetail />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />
              <Route path="/knowledge-base/:id" element={<ResourceDetail />} />
              <Route path="/checkin" element={<CheckIn />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/circles" element={<InterestCircles />} />
              <Route path="/circles/:id" element={<CircleDetail />} />
              <Route path="/invite" element={<Invite />} />
              <Route path="/profile/:id" element={<Profile />} />
            </Routes>
          </Suspense>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
