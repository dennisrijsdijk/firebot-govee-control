declare const SCRIPTS_DIR: string;
declare const PLUGIN_VERSION: string;

declare module '*.html' {
    const value: string;
    export default value;
}