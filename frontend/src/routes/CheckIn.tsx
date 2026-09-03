import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify-icon/react';
import api from '../lib/api';
import Skeleton from '../components/Skeleton';
import Avatar from '../components/Avatar';
import type { CheckIn, Challenge, Quote, CheckInFeedItem } from '../types';
import CheckInForm from '../components/CheckInForm';
import CheckInCalendar from '../components/CheckInCalendar';
import EncourageButton from '../components/EncourageButton';

const MOCK_PRACTICE_TOPIC = {
  theme: '接纳不完美的自己',
  description: '找出一件今天你觉得自己做得不够好，或者让你感到自卑的小事，尝试对自己说："虽然这件事没做好，但我依然接纳并喜爱这样的自己。"',
  tags: ['自我接纳', '课题分离'],
};

const MOCK_CHECKINS = [
  { date: '2026-05-24', mood: '😊', theme: '课题分离', content: '今天同事又在抱怨老板，我以前总是会被她的情绪带走，跟着一起郁闷。今天我尝试了课题分离：她的情绪是她的课题，我不需要为此负责。我礼貌地听了一会儿就去做自己的事了，心情非常平静。' },
  { date: '2026-05-23', mood: '💪', theme: '面对困难的勇气', content: '终于在开会的时候提出了自己的建议。虽然心跳很快，手也在抖，但我告诉自己，被反驳也没关系，重要的是我表达了自己。结果大家居然觉得我的建议很有参考价值！这种感觉太棒了。' },
  { date: '2026-05-22', mood: '🍃', theme: '活在当下', content: '下班路上没有玩手机，而是观察了路边的花草和夕阳。意识到生命就是由这些微小的瞬间组成的，过去不重要，未来还没到，只有现在是最真实的。' },
];

export default function CheckInPage() {
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null);
  const [monthlyCheckIns, setMonthlyCheckIns] = useState<CheckIn[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [totalDays, setTotalDays] = useState(0);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState<CheckIn | null>(null);
  const [myChallenges, setMyChallenges] = useState<Challenge[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [feed, setFeed] = useState<CheckInFeedItem[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/checkins/today').then(r => {
        setTodayCheckIn(r.status === 204 || !r.data ? null : r.data);
      }).catch(() => setTodayCheckIn(null)),
      api.get('/checkins/stats').then(r => {
        setTotalDays(r.data.totalDays);
        setStreak(r.data.streak || 0);
      }).catch(() => {}),
      api.get<Challenge[]>('/challenges/my').then(r => setMyChallenges(r.data)).catch(() => {}),
      api.get<Quote>('/quotes/daily').then(r => setQuote(r.data)).catch(() => {}),
      api.get<CheckInFeedItem[]>('/checkins/feed', { params: { limit: 10 } }).then(r => setFeed(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get<CheckIn[]>(`/checkins/monthly?year=${year}&month=${month}`)
      .then(r => setMonthlyCheckIns(r.data))
      .catch(() => setMonthlyCheckIns([]));
  }, [year, month]);

  const handleCheckInSuccess = (checkIn: CheckIn) => {
    const isNew = !todayCheckIn;
    setTodayCheckIn(checkIn);
    setShowForm(false);
    if (isNew) {
      setTotalDays(prev => prev + 1);
      setStreak(prev => prev + 1);
    }
    if (checkIn.postId) {
      alert('已同步到交流广场');
    }
    api.get<CheckIn[]>(`/checkins/monthly?year=${year}&month=${month}`)
      .then(r => setMonthlyCheckIns(r.data))
      .catch(() => {});
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-orange-50">
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="h-9 w-64 mb-8" />
            <Skeleton className="h-40 w-full rounded-2xl mb-6" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
          <div className="bg-white rounded-3xl p-6 border border-orange-50">
            <Skeleton className="h-6 w-24 mb-6" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const todayDate = new Date();
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  const todayStr = `${todayDate.getFullYear()}年${todayDate.getMonth() + 1}月${todayDate.getDate()}日 · 星期${weekDays[todayDate.getDay()]}`;

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <main className="pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 顶部概览 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* 今日打卡卡片 + 表单（移动端表单位于日历上方） */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-orange-50 relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-peach-500/5 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-gray-400 font-medium mb-1">{todayStr}</h2>
                    <h1 className="text-3xl font-bold">今天，你有改变的勇气吗？</h1>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-black text-peach-500">Day {streak || 1}</span>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">连续实践中</p>
                  </div>
                </div>

                {/* 今日实践主题 */}
                <div className="bg-warm-50 rounded-2xl p-6 mb-8 border border-orange-100/50">
                  <div className="flex items-center gap-3 mb-3">
                    <svg className="w-6 h-6 text-peach-500" fill="currentColor" viewBox="0 0 256 256"><path d="M224,160a48,48,0,0,0-48,48,8,8,0,0,0,16,0,32,32,0,0,1,32-32,8,8,0,0,0,0-16Zm-56,8a8,8,0,0,0-8-8,48,48,0,0,0-48,48,8,8,0,0,0,16,0,32,32,0,0,1,32-32A8,8,0,0,0,168,168Zm-32-8A48.06,48.06,0,0,0,88,208a8,8,0,0,0,16,0,32,32,0,0,1,32-32,8,8,0,0,0,0-16Zm-88,0a48,48,0,0,0-48,48,8,8,0,0,0,16,0,32,32,0,0,1,32-32,8,8,0,0,0,0-16Z"/></svg>
                    <h3 className="font-bold text-lg">今日实践主题</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    <span className="text-brown-900 font-bold">「{MOCK_PRACTICE_TOPIC.theme}」</span>
                    ：{MOCK_PRACTICE_TOPIC.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_PRACTICE_TOPIC.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-white text-gray-500 px-3 py-1 rounded-full border border-orange-100">
                        # {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {todayCheckIn && !showForm ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-grow bg-peach-50 text-peach-700 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 256 256"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/></svg>
                      今日已完成实践
                    </div>
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-white text-teal-500 border-2 border-teal-500 px-8 py-5 rounded-2xl font-bold hover:bg-teal-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/></svg>
                      修改感悟
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => setShowForm(true)}
                      className="flex-[1.35] bg-peach-500 text-white py-5 rounded-2xl font-bold text-xl shadow-lg animate-pulse-glow hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer border-2 border-peach-400/40"
                    >
                      <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 256 256"><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/></svg>
                      </div>
                      实践打卡
                    </button>
                    <Link
                      to="/invite"
                      className="flex-[1] bg-white text-teal-500 border-2 border-teal-500 py-5 rounded-2xl font-bold hover:bg-teal-500 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer no-underline group"
                    >
                      <Icon icon="ph:share-network-fill" width="24" className="group-hover:text-white" />
                      组队打卡
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* 表单（点击打卡后显示，位于日历上方） */}
            {showForm && (
              <CheckInForm
                initialData={todayCheckIn}
                onSuccess={handleCheckInSuccess}
                onCancel={() => setShowForm(false)}
              />
            )}
          </div>

          {/* 打卡统计/日历 */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-orange-50">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-peach-500" fill="currentColor" viewBox="0 0 256 256"><path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h40v8a8,8,0,0,0,16,0V48h24V80H88V48Zm136,24V208H48V72Zm-80,64a8,8,0,0,1,8,8v24a8,8,0,0,1-16,0V144A8,8,0,0,1,128,136Z"/></svg>
                勇气日历
              </h3>
              <div className="mb-6">
                <CheckInCalendar
                  checkIns={monthlyCheckIns}
                  year={year}
                  month={month}
                  onMonthChange={(y, m) => { setYear(y); setMonth(m); setSelectedDay(null); }}
                  onDayClick={c => setSelectedDay(selectedDay?.id === c.id ? null : c)}
                />
              </div>
              <div className="pt-6 border-t border-orange-50 flex items-center justify-around">
                <div className="text-center">
                  <p className="text-xl font-bold">{monthlyCheckIns.length}</p>
                  <p className="text-[10px] text-gray-400 uppercase">本月打卡</p>
                </div>
                <div className="w-px h-8 bg-orange-100" />
                <div className="text-center">
                  <p className="text-xl font-bold">{totalDays}</p>
                  <p className="text-[10px] text-gray-400 uppercase">累计勇气值</p>
                </div>
              </div>
            </div>
          </div>

          {/* 选中日详情 */}
          {selectedDay && (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50 mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-brown-900">{selectedDay.checkinDate}</h3>
                <button onClick={() => setSelectedDay(null)} className="text-xs text-gray-400 cursor-pointer border-0 bg-transparent hover:text-gray-600">关闭</button>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{selectedDay.content}</p>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* 我的实践记录 */}
            <div className="lg:w-2/3 space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 256 256"><path d="M216,48V88H40V48a8,8,0,0,1,8-8H208A8,8,0,0,1,216,48ZM40,168V104H216v64a16,16,0,0,1-16,16H56A16,16,0,0,1,40,168Z"/></svg>
                我的实践记录
              </h3>
              <div className="space-y-4">
                {monthlyCheckIns.length > 0 ? (
                  monthlyCheckIns.slice(0, 5).map((ci) => (
                    <div key={ci.id} className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-xl">{'😊'}</div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{ci.checkinDate}</p>
                          </div>
                        </div>
                        <button className="text-gray-300 hover:text-peach-500 bg-transparent border-0 cursor-pointer">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 256 256"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160,136,75.31,152.69,92,68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188,164,103.31,180.69,120Zm96-96L147.31,64l24-24L216,84.68Z"/></svg>
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{ci.content}</p>
                    </div>
                  ))
                ) : (
                  MOCK_CHECKINS.map((mc, i) => (
                    <div key={i} className={`bg-white p-6 rounded-3xl shadow-sm border border-orange-50 hover:shadow-md transition-shadow ${i === 2 ? 'opacity-70' : ''}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-xl">{mc.mood}</div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{mc.date}</p>
                            <p className="text-xs text-gray-400">实践主题：{mc.theme}</p>
                          </div>
                        </div>
                        <button className="text-gray-300 hover:text-peach-500 bg-transparent border-0 cursor-pointer">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 256 256"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM51.31,160,136,75.31,152.69,92,68,176.68ZM48,179.31,76.69,208H48Zm48,25.38L79.31,188,164,103.31,180.69,120Zm96-96L147.31,64l24-24L216,84.68Z"/></svg>
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">{mc.content}</p>
                    </div>
                  ))
                )}
              </div>
              <button className="w-full py-4 text-gray-400 font-medium hover:text-peach-500 transition-colors bg-transparent border-0 cursor-pointer">
                查看更多历史记录
              </button>
            </div>

            {/* 右侧边栏 */}
            <aside className="lg:w-1/3 space-y-8">
              {/* 同路人动态 */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-peach-500" fill="currentColor" viewBox="0 0 256 256"><path d="M117.18,157.17a60,60,0,1,0-66-19.47A60,60,0,0,0,117.18,157.17ZM28,106a36,36,0,1,1,36,36A36,36,0,0,1,28,106Zm153.82,51.17a60,60,0,1,0-66-19.47A60,60,0,0,0,181.82,157.17ZM124,106a36,36,0,1,1,36,36A36,36,0,0,1,124,106Zm33.13,76.27A96.36,96.36,0,0,0,98.87,160H76.82a120.13,120.13,0,0,1,150.36,22.27A8,8,0,0,1,221,193.34,104.1,104.1,0,0,0,157.13,182.27Z"/></svg>
                  同路人动态
                </h3>
                <div className="space-y-6">
                  {feed.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <Avatar name={item.author.nickname} src={item.author.avatarUrl} className="w-8 h-8" textClassName="text-xs" />
                      <div className="flex-grow">
                        <p className="text-xs">
                          <span className="font-bold">{item.author.nickname}</span>
                          <span className="text-gray-400 font-normal"> 完成了打卡</span>
                        </p>
                        <p className="text-[11px] text-gray-500 mt-1 bg-warm-50 p-2 rounded-lg whitespace-pre-wrap line-clamp-3">
                          {item.content}
                        </p>
                        <div className="mt-2">
                          <EncourageButton targetType="checkin" targetId={item.id} initialCount={item.encouragementCount} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {feed.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">还没有同路人动态，去完成今天的打卡吧</p>
                  )}
                </div>
              </div>

              {/* 热门挑战 */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-50">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-500" fill="currentColor" viewBox="0 0 256 256"><path d="M232,64V224a8,8,0,0,1-8,8H32a8,8,0,0,1-8-8V64a8,8,0,0,1,8-8H80V48a8,8,0,0,1,8-8h80a8,8,0,0,1,8,8v8h48A8,8,0,0,1,232,64ZM96,56h64V48H96ZM216,72H40v52.69L70.19,122a16,16,0,0,1,18.12.84l54.41,40.81L192.19,98.14A16,16,0,0,1,216,98.86V72Zm-176,68.67V216H216V119.65l-23.47,16.47a16,16,0,0,1-21.06-.72L117.06,94.59,62.93,124.35A16,16,0,0,1,40,123.66Z"/></svg>
                  热门挑战
                </h3>
                <div className="space-y-4">
                  {myChallenges.length > 0 ? (
                    myChallenges.slice(0, 2).map((c) => (
                      <div key={c.id} className={`p-4 rounded-2xl border group cursor-pointer hover:shadow-md transition-all ${
                        c.enrolled
                          ? 'bg-gradient-to-br from-orange-50 to-white border-orange-100'
                          : 'bg-gradient-to-br from-teal-50 to-white border-teal-100'
                      }`}>
                        <h4 className={`font-bold text-sm mb-1 ${c.enrolled ? 'group-hover:text-peach-500' : 'group-hover:text-teal-500'}`}>
                          {c.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 mb-3">已有 1,240 人参加</p>
                        {c.enrolled ? (
                          <>
                            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-peach-500 h-full rounded-full" style={{ width: `${c.targetCount > 0 ? Math.min(100, (c.progress / c.targetCount) * 100) : 0}%` }} />
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-[10px] font-bold text-peach-500">已坚持 {c.progress}/{c.targetCount} 天</span>
                              <svg className="w-4 h-4 text-gray-300 group-hover:text-peach-500" fill="currentColor" viewBox="0 0 256 256"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></svg>
                            </div>
                          </>
                        ) : (
                          <button className="w-full py-2 bg-teal-500 text-white text-[10px] font-bold rounded-xl hover:bg-opacity-90 cursor-pointer border-0">
                            立即加入
                          </button>
                        )}
                        {c.completed && (
                          <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">已完成</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-white border border-orange-100 group cursor-pointer hover:shadow-md transition-all">
                        <h4 className="font-bold text-sm mb-1 group-hover:text-peach-500">21天自我接纳挑战</h4>
                        <p className="text-[10px] text-gray-400 mb-3">已有 1,240 人参加</p>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-peach-500 h-full rounded-full" style={{ width: '70%' }} />
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] font-bold text-peach-500">已坚持 15/21 天</span>
                          <svg className="w-4 h-4 text-gray-300 group-hover:text-peach-500" fill="currentColor" viewBox="0 0 256 256"><path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"/></svg>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-white border border-teal-100 group cursor-pointer hover:shadow-md transition-all">
                        <h4 className="font-bold text-sm mb-1 group-hover:text-teal-500">7天课题分离速成</h4>
                        <p className="text-[10px] text-gray-400 mb-3">已有 3,560 人参加</p>
                        <button className="w-full py-2 bg-teal-500 text-white text-[10px] font-bold rounded-xl hover:bg-opacity-90 cursor-pointer border-0">
                          立即加入
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 勇气语录卡片 */}
              <div className="bg-brown-900 p-8 rounded-3xl text-warm-50 relative overflow-hidden group">
                <svg className="absolute -right-6 -top-6 text-white/5 group-hover:rotate-45 transition-transform duration-1000 w-[140px] h-[140px]" fill="currentColor" viewBox="0 0 256 256"><path d="M128,72a8,8,0,0,1,8,8v24h16a8,8,0,0,1,0,16H136v56a8,8,0,0,1-16,0V120H104a8,8,0,0,1,0-16h16V80A8,8,0,0,1,128,72ZM80,24H176a8,8,0,0,0,0-16H80a8,8,0,0,0,0,16ZM240,88V200a24,24,0,0,1-24,24H40a24,24,0,0,1-24-24V88A24,24,0,0,1,40,64H72A8,8,0,0,1,80,72v8h96V72a8,8,0,0,1,8-8h32A24,24,0,0,1,240,88ZM216,88a8,8,0,0,0-8-8H184v8a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V80H48a8,8,0,0,0-8,8V200a8,8,0,0,0,8,8H216a8,8,0,0,0,8-8Z"/></svg>
                <h4 className="font-bold text-lg mb-4 relative z-10">勇气时刻</h4>
                <p className="text-sm italic leading-relaxed text-gray-300 mb-6 relative z-10">
                  {quote ? `"${quote.content}"` : '"所谓的自由，就是被别人讨厌。"'}
                </p>
                <div className="text-right relative z-10">
                  <p className="text-xs font-bold text-peach-500">
                    —— {quote?.source || '《被讨厌的勇气》'}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
