import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';
import Home from './routes/Home';
import Login from './routes/Login';
import Register from './routes/Register';
import Forum from './routes/Forum';
import PostDetail from './routes/PostDetail';
import NewPost from './routes/NewPost';
import KnowledgeBase from './routes/KnowledgeBase';
import CheckIn from './routes/CheckIn';
import Groups from './routes/Groups';
import Invite from './routes/Invite';
import Profile from './routes/Profile';
import ProfileEdit from './routes/ProfileEdit';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/forum/new" element={<NewPost />} />
            <Route path="/forum/:id" element={<PostDetail />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="/checkin" element={<CheckIn />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/invite" element={<Invite />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/profile/:id" element={<Profile />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  );
}
