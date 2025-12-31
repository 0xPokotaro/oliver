/**
 * 音声録音関連のユーティリティ関数
 */

/**
 * MediaRecorderのサポートチェック
 * @returns MediaRecorderがサポートされている場合true
 */
export function checkMediaRecorderSupport(): boolean {
  return (
    typeof navigator !== "undefined" &&
    navigator.mediaDevices !== undefined &&
    typeof navigator.mediaDevices.getUserMedia === "function" &&
    typeof MediaRecorder !== "undefined"
  );
}

/**
 * サポートされている音声MIMEタイプを取得
 * 優先順位: audio/wav → audio/webm → audio/ogg
 * @returns サポートされているMIMEタイプ文字列
 */
export function getSupportedAudioMimeType(): string {
  if (MediaRecorder.isTypeSupported("audio/wav")) {
    return "audio/wav";
  }
  if (MediaRecorder.isTypeSupported("audio/webm")) {
    return "audio/webm";
  }
  return "audio/ogg";
}

/**
 * エラーメッセージの定数
 */
export const MEDIA_RECORDER_NOT_SUPPORTED_ERROR =
  "お使いのブラウザは音声録音をサポートしていません。ChromeまたはEdgeをご利用ください。";

export const MICROPHONE_PERMISSION_ERROR =
  "マイクの使用が許可されていません。ブラウザの設定でマイクへのアクセスを許可してください。";

export const RECORDING_START_ERROR = "録音を開始できませんでした。";

export const RECORDING_ERROR = "録音中にエラーが発生しました。";

