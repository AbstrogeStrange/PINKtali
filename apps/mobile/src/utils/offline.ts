import * as FileSystem from 'expo-file-system';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const DOWNLOAD_TASK = 'background-download-task';

TaskManager.defineTask(DOWNLOAD_TASK, async () => {
  try {
    // Process queued downloads
    console.log('Running background download task');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const downloadVideo = async (url: string, filename: string) => {
  const fileUri = `${FileSystem.documentDirectory}${filename}`;
  
  const downloadResumable = FileSystem.createDownloadResumable(
    url,
    fileUri,
    {},
    (downloadProgress) => {
      const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
      console.log(`Download progress: ${progress * 100}%`);
    }
  );

  try {
    const result = await downloadResumable.downloadAsync();
    console.log('Finished downloading to ', result?.uri);
    return result?.uri;
  } catch (e) {
    console.error(e);
  }
};

export const registerBackgroundDownload = async () => {
  return BackgroundFetch.registerTaskAsync(DOWNLOAD_TASK, {
    minimumInterval: 15 * 60, // 15 minutes
    stopOnTerminate: false, 
    startOnBoot: true,
  });
};
