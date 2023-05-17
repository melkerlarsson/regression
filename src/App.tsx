import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import "./App.css";

import "mafs/core.css";
import "mafs/font.css";

import { Mafs, Coordinates, Plot, Text, useMovablePoint, MovablePoint as MafsMovablePoint, vec, MovablePointProps } from "mafs";
import { QuadraticValues } from "./components/types";
import { INITIAL_VALUES } from "./components/constants";
import Sidebar from "./components/Sidebar";

const EPOCHS = 1000;
const LEARNING_RATE = 0.06;


type Point = {
	pos: vec.Vector2,
	id: number
}

const MovablePoint = ({ point, onMove, id }: { point: Point, id: number, onMove: (point: Point) => void }) => {
	return (
			<MafsMovablePoint point={point.pos} onMove={(point) => onMove({ pos: point, id: id })} />
	);
}

export default function App() {
	const windowHeight = useRef(window.innerHeight);
	const [vals, setVals] = useState<QuadraticValues>(INITIAL_VALUES);
	const [color, setColor] = useState<string>("red");

	const [points, setPoints] = useState<Point[]>([
		{ pos: [3, 2], id: 0 },
		{ pos: [4, 2], id: 1 },
		{ pos: [1, 2], id: 2 },
		{ pos: [0, 2], id: 3 },
	]);


	const regression = async () => {
		let newVals: QuadraticValues;
		let a = vals.a;
		let b = vals.b;
		let c = vals.c;
		for (let i = 0; i < EPOCHS; i++) {
			newVals = update_values_quadratic(a, b, c, points.map((point) => point.pos ), LEARNING_RATE);
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
			<Sidebar 
				setColor={setColor} 
				setVals={setVals} 
				regression={regression} 
				addPoint={(x, y) => setPoints((current) => [...current, { pos: [x, y], id: Math.random()}])} 
			/>
			<Mafs height={windowHeight.current} width={"auto"} zoom={{ min: 0.2, max: 1 }}>
				<Coordinates.Cartesian />
				<Text x={0} y={0} color={color}>
					f(x) = {vals.a.toPrecision(2)}x^2 + {vals.b.toPrecision(2)}x {vals.c.toPrecision(2)}
				</Text>

				{/* {points.map((point) => (
					<Point key={`${point[0]}${point[1]}`} x={point[0]} y={point[1]} />
				))} */}

				{
					points.map((point, i) => {
						return <MovablePoint 
							key={i} 
							point={point} 
							id={point.id}
							onMove={movedPoint => {
								const index = points.findIndex(p => p.id === movedPoint.id);
								const newPoints = points;
								newPoints[index] = movedPoint;

								setPoints([...newPoints]);
							}} />
					})
				}

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
	}

	delta_a /= points.length;
	delta_b /= points.length;
	delta_c /= points.length;

	return { a: a - delta_a, b: b - delta_b, c: c - delta_c };
};

const update_values_linear = (a: number, b: number, points: number[][], lr: number) => {
	let delta_a = 0;
	let delta_b = 0;
	for (let i = 0; i < points.length; i++) {
		const [x, y] = points[i];
		const a_change = -2 * x * (y - a * x - b);
		const b_change = -2 * (y - a * x - b);
		delta_a += a_change * lr;
		delta_b += b_change * lr;
	}
	delta_a /= points.length;
	delta_b /= points.length;

	return { a: a - delta_a, b: b - delta_b };
};
