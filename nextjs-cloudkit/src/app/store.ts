import CloudKit from 'tsl-apple-cloudkit';

CloudKit.configure({
  containers: [{
    // Update with your CloudKit container ID
    containerIdentifier: 'iCloud.dev.steveharrison.AzamCloudKitTutorial',
    apiTokenAuth: {
      // Update with your own CloudKit web token generated in the CloudKit Dashboard
      apiToken: '29e98f29cfd346f61028d8161ec9a4422a9aa9edbae0e57156ee3cf21593d0c1',
      persist: true,
      signInButton: {
        id: 'apple-sign-in-button',
        theme: 'black'
      },
      signOutButton: {
        id: 'apple-sign-out-button',
        theme: 'black'
      }
    },
    environment: 'development'
  }]
});

export async function getUser(): Promise<CloudKit.UserIdentity> {
  return new Promise((resolve, reject) => {
    CloudKit.getDefaultContainer()
      .setUpAuth()
      .then(async function(user: CloudKit.UserIdentity) {
        if (user) {
          console.log('setUpAuth - user: ', user);
          resolve(user);
        } else {
          console.log('setUpAuth - Not signed in.');
          reject();
        }
      })
      .catch(function(error: CloudKit.CKError) {
        console.error(error);
        if (error.ckErrorCode === 'AUTH_PERSIST_ERROR') {
          console.error("setUpAuth - Can't save the auth cookie.");
        }
        reject(error);
      });
  });
}

export async function fetchTasks() {
  return new Promise((resolve, reject) => {
    CloudKit.getDefaultContainer().privateCloudDatabase
      .performQuery({
        recordType: 'TaskItem',
        sortBy: {
          fieldName: 'dateAssigned',
          ascending: false
        }
      })
      .then(function(response: CloudKit.QueryResponse) {
        if (response.hasErrors) {
          reject(response.errors[0]);
        } else {
          resolve(response.records);
        }
      });
  });
}

export async function saveTask(title: string, dateAssigned: Date, isCompleted: boolean) {
  return new Promise((resolve, reject) => {
    CloudKit.getDefaultContainer().privateCloudDatabase
      .saveRecords({
        recordType: 'TaskItem',
        fields: {
          title: { value: title },
          dateAssigned: { value: dateAssigned.getTime() },
          isCompleted: { value: Number(isCompleted) }
        }
      })
      .then(function(response: CloudKit.QueryResponse) {
        if(response.hasErrors) {
          reject(response.errors[0]);
        } else {
          resolve(response.records[0]);
        }
      })
      .catch(reject);
  });
}

