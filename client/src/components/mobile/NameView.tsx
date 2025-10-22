import { useEffect, useRef, useState } from "react";

type NameViewProps = {
  name?: string;
  className?: string;

  changeName: (name: string) => void;
};

export function NameView({
  name,
  className,

  changeName,
}: NameViewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localName, setLocalName] = useState(name);
  const [isChangingName, setIsChangingName] = useState(false);

  useEffect(() => {
    if (!name) {
      setIsChangingName(true);
    }
    if (name) {
      setLocalName(name);
      setIsChangingName(false);
    }
  }, [name]);

  useEffect(() => {
    if (isChangingName) {
      inputRef?.current?.select();
    }
  }, [isChangingName]);

  return (
    <div
      className={`w-full flex flex-col justify-center items-center ${className ?? ""}`}
    >
      {/* Change state */}
      {isChangingName && (
        <>
          <form
            className="w-full max-w-sm flex flex-col gap-8"
            onSubmit={(e) => {
              e.preventDefault();
              if (localName?.trim() && changeName) {
                changeName(localName.trim());
                setIsChangingName(false);
              }
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Navn"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              maxLength={16}
              onFocus={(e) => {
                inputRef.current?.select();
                e.target.scrollIntoView({ behavior: "smooth" });
              }}
              onBlur={() => {
                if (!name) {
                  return;
                }
                setLocalName(name);
                setIsChangingName(false);
              }}
              className="h-16 placeholder-gray-600 text-center"
            />
          </form>
        </>
      )}

      {/* Change state inactive */}
      {!isChangingName && (
        <div
          className="w-full flex flex-col gap-y-4 justify-center items-center cursor-pointer hover:text-purple-200"
          onClick={() => {
            setIsChangingName(true);
            inputRef.current?.select();
          }}
        >
          <p className="text-3xl break-all text-center">{name}</p>
        </div>
      )}
    </div>
  );
}
