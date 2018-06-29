import * as React from "react";
import * as ReactDOM from "react-dom";
import { CHARACTORS, ICharactor } from "./charactors";
import { MathUtil } from "./util";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
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
        GlobalData.dropResult = {
            title: "占いCO",
            type: "co",
            className: "uranaishi"
        };
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

class UranaiResultView extends React.Component<{onDrop(chara: JinroCharactorProp): void}, {
    onDropOver: TJinroColor
}> {
    constructor(props: any) {
        super(props);
        this.state = {
            onDropOver: null
        }
    }
    private dragEnd(event: React.DragEvent<HTMLElement>, color: TJinroColor) {
        this.setState({
            onDropOver: null
        });
        event.preventDefault();
        const data = event.dataTransfer.getData("charactor");
        if (!data) {
            return;
        }
        GlobalData.dropResult = {
            title: color === "white" ? "片白" : "黒",
            type: "color",
            className: "katashiro"
        };
        const charactor: JinroCharactorProp = JSON.parse(data);
        charactor.color = color;
        this.props.onDrop(charactor);
    }

    private onDropOver(color: TJinroColor) {
        if (color !== null) {
            setTimeout(() => {
                    this.setState({
                    onDropOver: color
                });
            }, 10);
            return;
        }
        this.setState({
            onDropOver: color
        });
    }

    public render() {
        return (
        <div className="uranai-result"
            onDragLeave ={() => this.onDropOver(null)}
        >
            <div className={"result-child result-left " + (this.state.onDropOver === "white" ? "result-drop-over" : "")}
             onDragOver={(e) => e.preventDefault()}
             onDrop={(e) => this.dragEnd(e, "white")}
             onDragEnter ={() => this.onDropOver("white")}
             >
             白</div>
            <div className={"result-child result-right " + (this.state.onDropOver === "black" ? "result-drop-over" : "")}
             onDragOver={(e) => e.preventDefault()}
             onDrop={(e) => this.dragEnd(e, "black")}
             onDragEnter ={() => this.onDropOver("black")}
             >
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
    onDrop?(event: React.DragEvent<HTMLElement>): void;
}

interface ICharaJob {
    title: string;
    type: "co" | "color" | "dead" | "";
    className: string;
}

interface ICharaState {
    co?: string;
    color?: string;
    dead?: string;
}

class GlobalData {
    public static dropResult: ICharaJob | undefined = undefined;
}
class JinroCharactor extends React.Component<JinroCharactorProp, ICharaState> {
    constructor(props: JinroCharactorProp) {
        super(props);
        this.state = {} as any;
    }

    private onDragStart(event: React.DragEvent<HTMLElement>) {
        event.dataTransfer.setData("charactor", JSON.stringify(this.props));
    }

    private changeJob(job: ICharaJob) {
        if (job.type === "") {
            this.setState({
                co: undefined,
                color: undefined,
                dead: undefined
            });
            return;
        }
        this.setState({
            [job.type]: job.title
        });
    }

    private onDragEnd() {
        if (GlobalData.dropResult) {
            this.changeJob(GlobalData.dropResult);
        } else {
            GlobalData.dropResult = undefined;
        }

    }

    public render() {
        const key = MathUtil.createKey();
        const jobs: ICharaJob[] = [
            {
                title: "リセット",
                type: "",
                className: ""
            }, {
                title: "占いCO",
                type: "co",
                className: "uranai"
            }, {
                title: "霊能CO",
                type: "co",
                className: "reino"
            }, {
                title: "片白",
                type: "color",
                className: "katashiro"
            }, {
                title: "確定白",
                type: "color",
                className: "katashiro"
            }, {
                title: "黒",
                type: "color",
                className: "katashiro"
            }, {
                title: "処刑",
                type: "dead",
                className: "syokei"
            }, {
                title: "無残",
                type: "dead",
                className: "muzan"
            },
        ]
        return (
        <div className="jinro-charactor" draggable={true} onDragStart={(e) => this.onDragStart(e)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => this.props.onDrop && this.props.onDrop(e)}
            onDragEnd={(e) => this.onDragEnd()}
            >
            <ContextMenuTrigger id={key} holdToDisplay={-1}>
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
                if (this.state.co) {
                    return (<div className={`chara-mark chara-mark-co`}>{this.state.co}</div>);
                }
            })()}
            {(() => {
                if (this.state.color) {
                    return (<div className={`chara-mark chara-mark-color`}>{this.state.color}</div>);
                }
            })()}
            {(() => {
                if (this.state.dead) {
                    return (<div className={`chara-mark chara-mark-dead`}>{this.state.dead}</div>);
                }
            })()}
            {(() => {
                if (this.props.isSelectable) {
                    return (<button className="remove-charactor"
                     onClick={() => this.props.onRemove!(this.props.name)}>✕</button>);
                }
            })()}
            </ContextMenuTrigger>
            <ContextMenu id={key}>
                {jobs.map((job) => <MenuItem key={job.title} onClick={() => this.changeJob(job)}>
                    {job.title}</MenuItem>)}
            </ContextMenu>
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

    private dragEnd(event: React.DragEvent<HTMLElement>, newIndex: number) {
        event.preventDefault();
        const data = event.dataTransfer.getData("charactor");
        if (!data) {
            return;
        }
        const charactor: JinroCharactorProp = JSON.parse(data);
        const oldIndex = this.state.charactors.findIndex((chara) => chara.name === charactor.name);
        const temp = this.state.charactors[oldIndex];
        this.state.charactors[oldIndex] = this.state.charactors[newIndex];
        this.state.charactors[newIndex] = temp;
        this.forceUpdate();
    }

    public render() {
        return (
            <div className="select-charactor">
            {this.state.charactors.map((chara, i) => {
                return (<JinroCharactor name={chara.name}
                  onRemove={(name) => this.onRemove(name)}
                 image={chara.image} isSelectable={true} key={chara.name}
                 onDrop={(e) => this.dragEnd(e, i)}
                  />);
            })}
            </div>
        );
    }
}

class MainView extends React.Component<{}, {uranaiRows: string[], copyText: string}> {
    private uranaiRows: UranaiRow[];
    public dropResult: "uranaiShi" | "black" | "white" | undefined;
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
