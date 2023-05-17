import { INITIAL_VALUES } from "./constants";
import { QuadraticValues } from "./types";

type SidebarProps = {
  setColor: (color: string) => void;
  setVals: (vals: QuadraticValues) => void;
  regression: () => void;
	addPoint: (x: number, y: number) => void;
}

const Sidebar = ({ setColor, setVals, regression, addPoint }: SidebarProps) => {
	return (
		<div className="sidebar">
			<div>
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
			<SideBarInput addPoint={addPoint}/>
		</div>
	);
};

const SideBarInput = ({ addPoint }: { addPoint: (x: number, y: number) => void }) => {
	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		let text = e.currentTarget.value.trim();

		if (e.key === "Enter") {
			const pointRegex = /\( *[+-]?([0-9]*[.])?[0-9]+ *,  *[+-]?([0-9]*[.])?[0-9]+ *\)/;

			if (pointRegex.test(text)) {
				console.log(text);
				text = removeCharAt(text, 0);
				console.log(text);
				text = removeCharAt(text, text.length - 1);
				console.log(text);
				text = text.trim();

				console.log(text[0]), Number(text[text.length - 1]);

				addPoint(Number(text[0]), Number(text[text.length - 1]));
			}	
		}
	};

	return <input onKeyDown={onKeyDown} />;
};


export default Sidebar


const removeCharAt = (str: string, i: number) => {
		if (i<0 || i > str.length - 1) return str;

    const tmp = str.split('');
    tmp.splice(i - 1 , 1);
    return tmp.join('');
}