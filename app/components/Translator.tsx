"use client";

import { useState, useEffect, useRef } from "react";

import { default as languageCodesData } from "@/app/data/language-codes.json";
import { default as countryCodesData } from "@/app/data/country-codes.json";

const languageCodes: Record<string, string> = languageCodesData;
const countryCodes: Record<string, string> = countryCodesData;

const Translator = () => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const [isActive, setIsActive] = useState<boolean>(false);
  const [text, setText] = useState<string>();
  const [translation, setTranslation] = useState<string>();
  const [voices, setVoices] = useState<Array<SpeechSynthesisVoice>>();
  const [language, setLanguage] = useState<string>("pt-BR");

  const isSpeechDetected = false;

  const availableLanguages = Array.from(
    new Set(voices?.map(({ lang }) => lang))
  )
    .map((lang) => {
      const split = lang.split("-");
      const languageCode: string = split[0];
      const countryCode: string = split[1];
      return {
        lang,
        label: languageCodes[languageCode] || lang,
        dialect: countryCodes[countryCode],
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  // const activeLanguage = availableLanguages.find(
  //   ({ lang }) => language === lang
  // );

  const availableVoices = voices?.filter(({ lang }) => lang === language);
  const activeVoice =
    availableVoices?.find(({ name }) => name.includes("Google")) ||
    availableVoices?.find(({ name }) => name.includes("Luciana")) ||
    availableVoices?.[0];
  useEffect(() => {
    const voices = window.speechSynthesis.getVoices();

    if (Array.isArray(voices) && voices.length > 0) {
      setVoices(voices);
      return;
    }

    if ("onvoiceschanged" in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = function () {
        const voices = window.speechSynthesis.getVoices();
        setVoices(voices);
      };
    }
  }, []);

  function handleOnRecord() {
    if (isActive) {
      recognitionRef.current?.stop();
      setIsActive(false);
      return;
    }

    setText("");
    setTranslation("");
    speak("");
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();

    recognitionRef.current.onstart = function () {
      setIsActive(true);
    };

    recognitionRef.current.onend = function () {
      setIsActive(false);
    };

    recognitionRef.current.onresult = async function (event) {
      const transcript = event.results[0][0].transcript;

      setText(transcript);

      const results = await fetch("/api/translate", {
        method: "POST",
        body: JSON.stringify({
          text: transcript,
          targetLang: language,
        }),
      });

      if (!results.ok) {
        console.error(await results.text());
        return;
      }

      const { text: traduction } = await results.json();

      console.log("traduction: ", JSON.stringify(traduction));
      setTranslation(traduction);

      speak(traduction);
    };

    recognitionRef.current.start();
  }

  function speak(text: string) {
    const utterance = new SpeechSynthesisUtterance(text);

    if (activeVoice) {
      utterance.voice = activeVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className="flex flex-col w-full px-4 md:px-auto md:w-96 m-auto h-full justify-center gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <form className="bg-[#fffeee] rounded p-2">
            <div>
              <label className="block text-gray-800  text-[.6rem] font-bold mb-1">
                Translate to:
              </label>
              <select
                className="max-w-full text-[.7rem] rounded-sm border-zinc-300 md:px-2 py-1"
                name="language"
                value={language}
                onChange={(event) => {
                  setLanguage(event.currentTarget.value);
                }}
              >
                {availableLanguages.map(({ lang, label }) => {
                  return (
                    <option key={lang} value={lang}>
                      {label} ({lang})
                    </option>
                  );
                })}
              </select>
            </div>
          </form>
          <div className="p-4 rounded bg-[#fffeee] flex flex-col">
            <p className="bg-white flex gap-1 items-center rounded-xl">
              <span
                className={`block rounded-full w-5 h-5 flex-shrink-0 flex-grow-0 ${
                  isActive ? "bg-red-500" : "bg-red-900"
                } `}
              >
                <span className="sr-only">
                  {isActive ? "Actively recording" : "Not actively recording"}
                </span>
              </span>
              <span
                className={`block rounded w-full h-5 flex-grow-1 ${
                  isActive ? "bg-green-700" : "bg-green-900"
                }`}
              >
                <span className="sr-only">
                  {isSpeechDetected
                    ? "Speech is being recorded"
                    : "Speech is not being recorded"}
                </span>
              </span>
            </p>
          </div>
        </div>
        <div>
          <h3 className="font-medium text-xl text-gray-800 ">
            {" "}
            You just said...{" "}
          </h3>
          <p className="w-full p-2 text-gray-500 h-fit bg-[#fffeee] shadow-lg rounded">
            {text ? text : "Tell us what you thinking!"}
          </p>
        </div>
        <div>
          <h3 className="font-medium text-xl text-gray-800 "> Translation </h3>
          <p className="w-full p-2 text-gray-500 h-fit bg-[#fffeee] shadow-lg rounded">
            {translation ? translation : "Decinos lo que estas pensando!"}
          </p>
        </div>
      </div>
      <button
        onClick={handleOnRecord}
        className={`bg-[#fffeee]  p-2 rounded shadow
            font-semibold w-full hover:shadow-xl hover:border-none ${
              isActive ? "text-red-500" : "text-gray-800 "
            } `}
      >
        {isActive ? "Stop" : "Record"}
      </button>
    </div>
  );
};

export default Translator;
