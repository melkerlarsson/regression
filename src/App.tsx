import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import "./App.css";

import "mafs/core.css";
import "mafs/font.css";

import { Mafs, Coordinates, Point, Plot, Text, useMovablePoint } from "mafs";

type Vals = { a: number; b: number; c: number };

const EPOCHS = 1000;
const LEARNING_RATE = 0.06;

const INITIAL_VALUES: Vals = { a: 0, b: 0, c: 0 };

export default function App() {
	const windowHeight = useRef(window.innerHeight);
	const [vals, setVals] = useState<Vals>(INITIAL_VALUES);
	const [color, setColor] = useState<string>("red");

	const p1 = useMovablePoint([-1, -3]);
	const p2 = useMovablePoint([0, 0]);
	const p3 = useMovablePoint([1, -3]);

	const points = [
		[p1.x, p1.y],
		[p2.x, p2.y],
		[p3.x, p3.y],
	];

	const regression = async () => {
		let newVals: Vals;
		let a = vals.a;
		let b = vals.b;
		let c = vals.c;
		for (let i = 0; i < EPOCHS; i++) {
			newVals = update_values_quadratic(a, b, c, points, LEARNING_RATE);
			a = newVals.a;
			b = newVals.b;
			c = newVals.c;

			await timeout(5);
			flushSync(() => {
				setVals(() => newVals);
			});
		}
		setColor("green");
	};

	return (
		<div className="container">
			<div className="sidebar">
				<button
					onClick={() => {
						setVals(INITIAL_VALUES);
						setColor("red");
					}}
				>
					Reset
				</button>
				<button
					onClick={() => {
						setColor("red");
						regression();
					}}
				>
					Start
				</button>
			</div>
			<Mafs height={windowHeight.current} zoom={{ min: 0.2, max: 1 }}>
				<Coordinates.Cartesian />
				<Text x={0} y={0} color={color}>
					f(x) = {vals.a.toPrecision(2)}x^2 + {vals.b.toPrecision(2)}x {vals.c.toPrecision(2)}
				</Text>

				{/* {points.map((point) => (
					<Point key={`${point[0]}${point[1]}`} x={point[0]} y={point[1]} />
				))} */}

				{p1.element}
				{p2.element}
				{p3.element}

				<Plot.OfX y={(x) => vals.a * Math.pow(x, 2) + vals.b * x + vals.c} />
			</Mafs>
		</div>
	);
}

function timeout(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const update_values_quadratic = (a: number, b: number, c: number, points: number[][], lr: number) => {
	let delta_a = 0;
	let delta_b = 0;
	let delta_c = 0;
	for (let i = 0; i < points.length; i++) {
		const [x, y] = points[i];
		const p = -2 * (y - a * Math.pow(x, 2) - b * x - c);
		const a_change = Math.pow(x, 2) * p;
		const b_change = x * p;
		const c_change = p;
		delta_a += a_change * lr;
		delta_b += b_change * lr;
		delta_c += c_change * lr;

		delta_a /= points.length;
		delta_b /= points.length;
		delta_c /= points.length;
	}
	return { a: a - delta_a, b: b - delta_b, c: c - delta_c };
};
