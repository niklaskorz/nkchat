declare module 'material-color-hash' {
  export interface MaterialStyle {
    backgroundColor: string;
    color: string;
    materialColorName: string;
  }

  export default function toMaterialStyle(text: string, shade?: number): MaterialStyle;
}
