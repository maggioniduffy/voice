import Image from "next/image";
import Translator from "./components/Translator";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center m-20 h-full gap-10">
      <h1 className="text-4xl font-bold text-black"> Voice2Text </h1>
      <Translator />
    </div>
  );
}
