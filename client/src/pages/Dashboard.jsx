export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          안녕하세요, {user?.nickname || "Runner"}님 👋
        </h1>
        <button
          className="text-sm text-gray-600 underline"
          onClick={() => {
            localStorage.clear();
            location.href = "/login";
          }}
        >
          로그아웃
        </button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="p-4 border rounded-2xl">🏃 이번 주 기록 카드(추가 예정)</div>
        <div className="p-4 border rounded-2xl">⚔️ 대결 시작/매칭 영역(추가 예정)</div>
      </div>
    </div>
  );
}
