import {
  IconBolt,
  IconArrowRight,
  IconCheck,
  IconStarFilled,
} from "@tabler/icons-react";
import { Button, Badge } from "@mantine/core";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="relative h-full bg-slate-50 overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900  rounded-2xl  mt-5">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-pink-300 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      <section className="relative z-10 pt-20 pb-20 px-6 ">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <Badge
              variant="light"
              color="indigo"
              size="lg"
              radius="md"
              className="py-3 px-4"
            >
              ✨ Phiên bản 2.0 đã ra mắt
            </Badge>

            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              Quản lý dự án <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                không giới hạn
              </span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed max-w-lg">
              Đừng để công việc rối tung. Krello mang đến không gian làm việc
              trực quan, giúp team của bạn "flow" mượt mà từ ý tưởng đến hoàn
              thiện.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                component={Link}
                to="/board"
                size="xl"
                radius="full"
                color="indigo"
                rightSection={<IconArrowRight size={20} />}
                className="shadow-xl shadow-indigo-200 hover:shadow-indigo-300 transition-all transform hover:-translate-y-1"
              >
                Bắt đầu miễn phí
              </Button>

              <div className="flex items-center gap-3 px-4 py-2">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <img
                      key={i}
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt="user"
                      className="w-10 h-10 rounded-full border-2 border-white"
                    />
                  ))}
                </div>
                <div className="text-sm text-slate-600">
                  <div className="flex text-yellow-400">
                    <IconStarFilled size={12} />
                    <IconStarFilled size={12} />
                    <IconStarFilled size={12} />
                    <IconStarFilled size={12} />
                    <IconStarFilled size={12} />
                  </div>
                  <span className="font-semibold text-slate-900">10k+</span> tin
                  dùng
                </div>
              </div>
            </div>
          </div>

          <div className="relative perspective-[2000px] group">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 blur-3xl opacity-20 rounded-full transform translate-y-10 group-hover:opacity-30 transition-opacity duration-500"></div>

            <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl p-6 transform rotate-y-[-12deg] rotate-x-[5deg] hover:rotate-y-[-5deg] hover:rotate-x-[2deg] transition-all duration-700 ease-out origin-center">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 text-center text-xs font-medium text-slate-400 bg-slate-50 py-1 rounded-md mx-4">
                  krello.app/board/marketing
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-semibold text-slate-700 px-1">
                    <span>Cần làm</span>
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-xs">
                      3
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600 mb-2">
                      High Priority
                    </span>
                    <p className="text-sm text-slate-800 font-medium">
                      Thiết kế Landing Page
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 opacity-60">
                    <div className="h-2 w-16 bg-slate-100 rounded mb-2"></div>
                    <div className="h-3 w-full bg-slate-100 rounded"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-semibold text-slate-700 px-1">
                    <span>Đang chạy</span>
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full text-xs">
                      2
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl shadow-lg border-l-4 border-indigo-500 ring-1 ring-indigo-50 transform scale-105">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-600 mb-2">
                      Dev
                    </span>
                    <p className="text-sm text-slate-800 font-medium mb-2">
                      Tích hợp API thanh toán
                    </p>
                    <div className="flex justify-between items-center border-t border-slate-50 pt-2">
                      <div className="flex -space-x-1">
                        <img
                          src="https://i.pravatar.cc/100?img=12"
                          className="w-5 h-5 rounded-full border border-white"
                        />
                        <img
                          src="https://i.pravatar.cc/100?img=33"
                          className="w-5 h-5 rounded-full border border-white"
                        />
                      </div>
                      <IconBolt size={14} className="text-indigo-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-semibold text-slate-700 px-1">
                    <span>Hoàn thành</span>
                    <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-xs">
                      5
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-green-100 p-1 rounded-full">
                        <IconCheck size={10} className="text-green-600" />
                      </div>
                      <span className="text-xs text-slate-400 line-through">
                        Họp team tuần
                      </span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-green-100 p-1 rounded-full">
                        <IconCheck size={10} className="text-green-600" />
                      </div>
                      <span className="text-xs text-slate-400 line-through">
                        Gửi báo cáo tháng
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
