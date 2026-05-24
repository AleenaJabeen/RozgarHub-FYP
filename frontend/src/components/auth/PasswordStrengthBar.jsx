export const PasswordStrengthBar = ({ password }) => {
  const criteria = [
    { test: password.length >= 8,        label: "At least 8 characters" },
    { test: /[A-Z]/.test(password),      label: "One uppercase letter (A-Z)" },
    { test: /[a-z]/.test(password),      label: "One lowercase letter (a-z)" },
    { test: /[0-9]/.test(password),      label: "One number (0-9)" },
    { test: /[!@#$%^&*]/.test(password), label: "One special character (!@#$%^&*)" },
  ];

  const score = criteria.filter((c) => c.test).length;

  const levels = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const colors = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-blue-500", "bg-green-500"];
  const textColors = ["", "text-red-500", "text-orange-400", "text-yellow-400", "text-blue-500", "text-green-500"];

  return (
    <div className="mt-2 px-1">

      {/* Strength Bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? colors[score] : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Strength Label */}
      <p className={`text-xs mt-1 ml-1 font-medium ${textColors[score]}`}>
        {levels[score]}
      </p>

      {/* Criteria Checklist */}
      <ul className="mt-2 space-y-1">
        {criteria.map((c, i) => (
          <li key={i} className={`flex items-center gap-2 text-xs ${c.test ? "text-green-500" : "text-gray-400"}`}>
            <span>{c.test ? "✔" : "✖"}</span>
            <span>{c.label}</span>
          </li>
        ))}
      </ul>

    </div>
  );
};