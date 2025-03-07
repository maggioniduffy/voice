import Translator from "./components/Translator";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-20 h-screen gap-2">
      <h1 className="text-5xl font-semibold text-gray-800 drop-shadow-lg">
        {" "}
        Voice<b className="text-violet-400">2</b>Text{" "}
      </h1>
      <Translator />
    </div>
  );
}
