import React, { useEffect, useState } from 'react';

// A tiny framer-motion-style shim that produces REAL animations with plain
// React + CSS transitions. Elements animate from `initial` to `animate` on
// mount, and `whileHover` / `whileTap` add interactive transforms. No runtime
// animation library is bundled.

type MotionValues = {
  opacity?: number;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
};

type Transition = { duration?: number; delay?: number };

type MotionProps = Record<string, unknown> & {
  children?: React.ReactNode;
  initial?: MotionValues | false;
  animate?: MotionValues;
  exit?: MotionValues;
  transition?: Transition;
  whileHover?: MotionValues;
  whileTap?: MotionValues;
  style?: React.CSSProperties;
};

const motionOnlyProps = new Set([
  'initial',
  'animate',
  'exit',
  'transition',
  'whileHover',
  'whileTap',
  'whileFocus',
  'layout',
  'variants',
]);

function toStyle(values?: MotionValues | false): React.CSSProperties {
  if (!values) return {};
  const transforms: string[] = [];
  if (values.x !== undefined) transforms.push(`translateX(${values.x}px)`);
  if (values.y !== undefined) transforms.push(`translateY(${values.y}px)`);
  if (values.scale !== undefined) transforms.push(`scale(${values.scale})`);
  if (values.rotate !== undefined) transforms.push(`rotate(${values.rotate}deg)`);

  const style: React.CSSProperties = {};
  if (values.opacity !== undefined) style.opacity = values.opacity;
  if (transforms.length) style.transform = transforms.join(' ');
  return style;
}

function createMotionElement(tagName: keyof React.JSX.IntrinsicElements) {
  return React.forwardRef<HTMLElement, MotionProps>((props, ref) => {
    const initial = props.initial as MotionValues | false | undefined;
    const animate = props.animate as MotionValues | undefined;
    const transition = props.transition as Transition | undefined;
    const whileHover = props.whileHover as MotionValues | undefined;
    const whileTap = props.whileTap as MotionValues | undefined;
    const style = props.style as React.CSSProperties | undefined;
    const children = props.children as React.ReactNode;
    const [entered, setEntered] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [pressed, setPressed] = useState(false);

    useEffect(() => {
      const frame = requestAnimationFrame(() => setEntered(true));
      return () => cancelAnimationFrame(frame);
    }, []);

    const domProps: Record<string, unknown> = {};
    Object.entries(props).forEach(([key, value]) => {
      if (!motionOnlyProps.has(key) && key !== 'children' && key !== 'style') {
        domProps[key] = value;
      }
    });

    const duration = transition?.duration ?? 0.4;
    const delay = transition?.delay ?? 0;

    const base = entered ? toStyle(animate) : toStyle(initial ?? animate);
    const interactive = pressed ? toStyle(whileTap) : hovered ? toStyle(whileHover) : {};

    const mergedStyle: React.CSSProperties = {
      ...style,
      ...base,
      ...interactive,
      transition: `transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, opacity ${duration}s ease ${delay}s`,
      willChange: 'transform, opacity',
    };

    const interactionHandlers =
      whileHover || whileTap
        ? {
            onMouseEnter: () => setHovered(true),
            onMouseLeave: () => {
              setHovered(false);
              setPressed(false);
            },
            onMouseDown: () => setPressed(true),
            onMouseUp: () => setPressed(false),
          }
        : {};

    return React.createElement(
      tagName,
      { ...domProps, ...interactionHandlers, ref, style: mergedStyle },
      children as React.ReactNode,
    );
  });
}

export const motion = {
  article: createMotionElement('article'),
  button: createMotionElement('button'),
  div: createMotionElement('div'),
  footer: createMotionElement('footer'),
  form: createMotionElement('form'),
  header: createMotionElement('header'),
  h1: createMotionElement('h1'),
  h2: createMotionElement('h2'),
  li: createMotionElement('li'),
  main: createMotionElement('main'),
  nav: createMotionElement('nav'),
  ol: createMotionElement('ol'),
  p: createMotionElement('p'),
  section: createMotionElement('section'),
  span: createMotionElement('span'),
};

export function AnimatePresence({ children }: { children: React.ReactNode; mode?: string }) {
  return <>{children}</>;
}
