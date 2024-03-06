import React from "react";

interface IProps {
  className?: string;
  theme?: "dark" | "light" | "yellow";
  tip?: string;
}
export const Spin: React.FC<IProps> = (props) => {
  const { className, theme = "light", tip, children } = props;
  return (
    <div
      className={["spin", className, `spin--${theme}`]
        .filter(Boolean)
        .join(" ")}
      style={{
        fontSize: "100px",
      }}
    >
      <div className={"spin__inner"}>
        <div className={"spin__line"}>
          <div className={"spin__dot"} />
          <div className={"spin__dot"} />
          <div className={"spin__dot"} />
          <div className={"spin__dot"} />
          <div className={"spin__dot"} />
          <div className={"spin__dot"} />
        </div>
      </div>
      <div className={"spin__tip"}>{tip || children}</div>
    </div>
  );
};

export default Spin;
