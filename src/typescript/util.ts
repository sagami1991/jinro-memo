export type IconName = "icon-play";
export type IconSize = "s" | "m"  | "32" | "48";

export class ElementUtil {
    static builder(html: string) {
        const container = document.createElement("div");
        container.innerHTML = html;
        if (container.children.length !== 1) {
            throw new Error(`親要素はひとつまで 数: ${container.children.length} html: ${html}`);
        }
        const element = container.firstElementChild;
        container.removeChild(element!);
        return element as HTMLElement;
    }

    static getSvgIcon(icon: IconName, size: IconSize = "m", className?: string): string {
        return `
        <svg xmlns="http://www.w3.org/2000/svg" class="icon-svg icon-${size} ${className || ""}">
            <use xlink:href="#${icon}"/>
        </svg>`;
    }

}

export class MathUtil {
    public static average(array: number[] | Uint8Array) {
        return MathUtil.sum(array) / array.length;
    }

    public static sum(array: number[] | Uint8Array) {
        let sum = 0;
        for (const num of array) {
            sum += num;
        }
        return sum;
    }

    public static getIndexOfMaxValue(array: Uint8Array) {
        return array.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
    }

    public static tail<T>(array: T[]) {
        return array[array.length - 1];
    }

    public static createKey() {
        return "_" + Math.random().toString(36).substr(2, 9);
    }
}