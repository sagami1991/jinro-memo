import * as React from "react";
import * as ReactDOM from "react-dom";
import { CHARACTORS, ICharactor } from "./charactors";
import { MathUtil } from "./util";


interface UranaiRowProps {
    onRemove(): void;
}

interface UranaiRowStates {
    uranaiShi: JinroCharactorProp;
    uranaiResults: Array<JinroCharactorProp & {id: string}>;
}
class UranaiRow extends React.Component<UranaiRowProps, UranaiRowStates> {
    constructor(props: UranaiRowProps) {
        super(props);
        this.state = {
            uranaiShi: undefined,
            uranaiResults: []
        } as any;
    }

    public getText() {
        if (!this.state.uranaiShi) {
            return "";
        }
        return `${this.state.uranaiShi.name}→${this.state.uranaiResults.map((person) => {
            return `${person.name}${person.color === "white" ? "○" : "●"}`;
            }
        ).join("")}`;
    }
    private dragEnd(event: React.DragEvent<HTMLElement>) {
        event.preventDefault();
        if (this.state.uranaiShi) {
            return;
        }
        const data = event.dataTransfer.getData("charactor");
        if (!data) {
            return;
        }
        const charactor: JinroCharactorProp = JSON.parse(data);
        this.setState({
            uranaiShi: charactor
        });
    }

    private addResults(chara: JinroCharactorProp) {
        const charactor = {
            ...chara,
            id: MathUtil.createKey()
        };
        this.state.uranaiResults.push(charactor);
        this.forceUpdate();
    }

    private onRemove(id: string) {
        this.setState({
            uranaiResults: this.state.uranaiResults.filter((person) => person.id !== id)
        });
    }

    public render() {
        return (
        <div className="uranai-row">
            <div className="uranai"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => this.dragEnd(e)}>
                 {this.state.uranaiShi ?
                 <JinroCharactor name={this.state.uranaiShi.name}
                  image={this.state.uranaiShi.image}
                  isUranaishi={true} />
                   : "占い師"}
            </div>
            <div className="uranai-results">
                {this.state.uranaiResults.map((result) => {
                    return (
                    <div className="uranai-result" key={result.id}>
                        <JinroCharactor name={result.name} image={result.image} color={result.color}/>
                        <button className="remove-result" onClick={() => this.onRemove(result.id)}>✕</button>
                    </div>
                    );
                })}
            </div>
            <UranaiResultView onDrop={(chara) => this.addResults(chara)}/>
            <button className="remove-uranai-row" onClick={this.props.onRemove}>✕</button>
        </div>
        );
    }

}

class UranaiResultView extends React.Component<{onDrop(chara: JinroCharactorProp): void}> {
    public dragEnd(event: React.DragEvent<HTMLElement>, color: TJinroColor) {
        event.preventDefault();
        const data = event.dataTransfer.getData("charactor");
        if (!data) {
            return;
        }
        const charactor: JinroCharactorProp = JSON.parse(data);
        charactor.color = color;
        this.props.onDrop(charactor);
    }
    public render() {
        return (
        <div className="uranai-result">
            <div className="result-child result-left"
             onDragOver={(e) => e.preventDefault()}
             onDrop={(e) => this.dragEnd(e, "white")}>
             白</div>
            <div className="result-child result-right"
             onDragOver={(e) => e.preventDefault()}
             onDrop={(e) => this.dragEnd(e, "black")}>
             黒</div>
        </div>
        );
    }

}

type TJinroColor = "black" | "white" | null;

interface JinroCharactorProp {
    image: string;
    name: string;
    color?: TJinroColor;
    isUranaishi?: true;
    isSelectable?: true;
    onRemove?(name: string): void;
}

class JinroCharactor extends React.Component<JinroCharactorProp> {
    constructor(props: JinroCharactorProp) {
        super(props);
    }
    public onDragStart(event: React.DragEvent<HTMLElement>) {
        event.dataTransfer.setData("charactor", JSON.stringify(this.props));
    }
    public render() {
        return (
        <div className="jinro-charactor" draggable={true} onDragStart={(e) => this.onDragStart(e)}>
            <img src={"charactor/" + this.props.image} className="charactor-image" />
            {(() => {
                if (this.props.isUranaishi) {
                    return (<div className="chara-mark chara-mark-uranai">占い師</div>);
                }
                if (this.props.color === "white") {
                    return (<div className="chara-mark chara-mark-white">人狼でない</div>);
                }
                if (this.props.color === "black") {
                    return (<div className="chara-mark chara-mark-black">人狼</div>);
                }
            })()}
            {(() => {
                if (this.props.isSelectable) {
                    return (<button className="remove-charactor"
                     onClick={() => this.props.onRemove!(this.props.name)}>✕</button>);
                }
            })()}
        </div>
        );
    }

}

class SelectCharctorView extends React.Component<{}, {charactors: ICharactor[]}> {
    constructor(props: {}) {
        super(props);
        this.state = {
            charactors: CHARACTORS
        };

    }

    private onRemove(name: string) {
        this.setState({
            charactors: this.state.charactors.filter((chara) => chara.name !== name)
        });
    }

    public render() {
        return (
            <div className="select-charactor">
            {this.state.charactors.map((chara, i) => {
                return (<JinroCharactor name={chara.name}
                  onRemove={(name) => this.onRemove(name)}
                 image={chara.image} isSelectable={true} key={i} />);
            })}
            </div>
        );
    }
}

class MainView extends React.Component<{}, {uranaiRows: string[], copyText: string}> {
    private uranaiRows: UranaiRow[];
    constructor(props: any) {
        super(props);
        this.state = {
            uranaiRows: [MathUtil.createKey()],
            copyText: ""
        };
        this.uranaiRows = [];
    }
    private onAddClick() {
        this.state.uranaiRows.push(MathUtil.createKey());
        this.forceUpdate();
    }

    private onCopyClick() {
        const copyText = this.uranaiRows.map((row) => row.getText()).join("\r\n");
        this.setState({
            copyText: this.uranaiRows.map((row) => row.getText()).join("\r\n")
        });
        const copyTextElement = document.querySelector(".copy-text-area") as HTMLTextAreaElement;
        copyTextElement.textContent = copyText;
        copyTextElement.select();
        const copyResult = document.execCommand("copy");
    }

    private removeRow(id: string) {
        const deleteIndex = this.state.uranaiRows.findIndex((ida) => ida === id);
        this.state.uranaiRows.splice(deleteIndex, 1);
        this.setState({uranaiRows: this.state.uranaiRows});
    }

    public render() {
        const uranaiRows = this.state.uranaiRows.map((id) => {
            return (<UranaiRow key={id} onRemove={() => this.removeRow(id)}
               ref={(instance) => {
                   if (instance) {
                       this.uranaiRows.push(instance);
                   } else {
                       this.uranaiRows = [];
                   }
               }} />);
        });
        return (
            <div>
                {uranaiRows}
                <button onClick={() => this.onAddClick()}>追加</button>
                <button onClick={() => this.onCopyClick()}>テキストコピー</button>
                <SelectCharctorView/>
            </div>
        );
    }
}

ReactDOM.render(
  <MainView />,
  document.querySelector(".main")
);
