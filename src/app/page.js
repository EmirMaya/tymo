import Calendar from "./components/Calendar";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-200 p-4">
      <h1 className="text-3xl font-bold mb-6 w-full bg-teal-300">TYMO</h1>
      <Calendar />
    </main>
  );
}
