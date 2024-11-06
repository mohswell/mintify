import { IconX } from "@tabler/icons-react";
import React, { useState, useRef, KeyboardEvent, ChangeEvent } from "react";

interface TagInputProps {
  label?: string;
  placeholder?: string;
  value?: string[];
  onChange?: (tags: string[]) => void;
}

export default function TagInput({
  value,
  label,
  onChange,
  placeholder = "Enter tags...",
}: TagInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [tags, setTags] = useState<string[]>(value || []);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();

    if (trimmedTag && !tags.includes(trimmedTag)) {
      const newTags = [...tags, trimmedTag];

      setTags(newTags);
      onChange?.(newTags);
    }
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);

    setTags(newTags);
    onChange?.(newTags);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;

    if (value.includes(",")) {
      const newTag = value.replace(",", "");

      addTag(newTag);
      setInput("");
    } else {
      setInput(value);
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input) {
      e.preventDefault();

      addTag(input);
      setInput("");
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="flex flex-col items-start justify-start w-full gap-y-3">
      {label ? (
        <label
          htmlFor="tag-input"
          className="text-base !leading-4 tracking-[2%] font-normal w-fit text-black dark:text-white flex justify-start items-center gap-x-1"
        >
          {label}
        </label>
      ) : null}

      <div
        onClick={() => inputRef.current?.focus()}
        className="flex flex-wrap gap-1.5 justify-start items-start border text-dark px-4 py-3 border-light-gray-6 bg-light-gray-1 placeholder-light-gray-6 dark:text-white dark:border-dark dark:bg-dark-background dark:placeholder-light-gray-7 focus:border-dark dark:focus:border-white focus-within:border-dark dark:focus-within:border-white rounded-lg min-h-[168px] text-base !leading-4 focus:placeholder-transparent dark:focus:placeholder-transparent font-light relative w-full z-[1] transition-all duration-300 ease-in-out disabled:border-light-gray-3 hover:cursor-text disabled:text-light-gray-7 disabled:bg-light-gray-2 dark:disabled:border-dark-background dark:disabled:text-light-gray-7 dark:disabled:bg-dark"
      >
        <div className="w-full flex flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="flex items-center font-normal p-1.5 text-base !leading-4 rounded bg-light-gray-5 text-black dark:bg-dark-2 dark:text-white"
            >
              {tag}

              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 inline-flex items-center p-0.5 !leading-4 text-light-gray-6"
              >
                <IconX className="h-auto w-3 shrink-0" />
              </button>
            </span>
          ))}

          {tags.length === 0 && !input.trim() && (
            <span className="text-base font-light text-light-gray-6 absolute top-3">
              {placeholder}
            </span>
          )}

          <input
            ref={inputRef}
            type="text"
            value={input}
            id="tag-input"
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            className="w-fit max-w-36 outline-none border-none focus:border-none focus:outline-none bg-transparent text-base text-dark dark:text-white h-[26px] mb-auto"
          />
        </div>
      </div>
    </div>
  );
}
