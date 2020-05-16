import invoke from 'lodash.invoke';
import uniqueId from 'lodash.uniqueid';
import { always, cond, equals } from 'ramda';

import StoreRegistry from '../../store/storeRegistry';
import { NATIVE_DATA_SET_SERVICES_STATUS_SUCCESS } from '../../store/types/nativeData';
import { DATA_TYPE } from './nativeBridge.constants';
import { UPLOAD_HISTORICAL_DATA_FINISHED } from '../../store/types/app';
import { isAndroidWebView } from '../../utils/native';

const nativeRequests = {};

const windowObject = isAndroidWebView() ? window.NativeBridge : window.webkit;

const sendNativeRequest = (functionName, dataType, data) => {
  const requestId = uniqueId('request-');
  return new Promise((resolve, reject) => {
    nativeRequests[requestId] = { resolve, reject };
    const functionParameter = isAndroidWebView()
      ? functionName
      : `messageHandlers.${functionName}.postMessage`;
    invoke(windowObject, functionParameter, {
      type: dataType,
      data,
      requestId
    });
  });
};

const receiveNativeResponse = (body, dataType, requestId) => {
  try {
    nativeRequests[requestId].resolve(body);
  } catch (error) {
    console.error('requestId', requestId, error);
    nativeRequests[requestId].reject(error);
  }
  delete nativeRequests[requestId];
};

const callNativeFunction = async (functionName, dataType, data) => {
  const args = [dataType];
  if (data) {
    args.push(JSON.stringify(data));
  }

  return sendNativeRequest(functionName, ...args);
};

const callGetBridgeData = async dataType => {
  try {
    const json = await callNativeFunction('getBridgeData', dataType);
    if (json) {
      return JSON.parse(json);
    }
  } catch (error) {
    console.error('Error while parsing native response', error);
  }
  return '';
};

const getNotification = async () => {
  return callGetBridgeData(DATA_TYPE.NOTIFICATION);
};

const getServicesStatus = async () => {
  return callGetBridgeData(DATA_TYPE.NATIVE_SERVICES_STATUS);
};

const setDiagnosisTimestamp = async timestamp => {
  await callNativeFunction('setBridgeData', DATA_TYPE.FILLED_DIAGNOSIS, {
    timestamp
  });
};

const setPin = async pin => {
  await callNativeFunction('setBridgeData', DATA_TYPE.HISTORICAL_DATA, {
    pin
  });
};

const setServicesState = async data => {
  await callNativeFunction(
    'setBridgeData',
    DATA_TYPE.NATIVE_SERVICES_STATE,
    data
  );
};

const handleServicesStatus = servicesStatus => {
  const store = StoreRegistry.getStore();
  store.dispatch({
    servicesStatus,
    type: NATIVE_DATA_SET_SERVICES_STATUS_SUCCESS
  });
};

const handleUploadHistoricalDataResponse = ({ result }) => {
  const store = StoreRegistry.getStore();
  store.dispatch({
    result,
    type: UPLOAD_HISTORICAL_DATA_FINISHED
  });
};

const callBridgeDataHandler = cond([
  [equals(DATA_TYPE.NATIVE_SERVICES_STATUS), always(handleServicesStatus)],
  [
    equals(DATA_TYPE.HISTORICAL_DATA),
    always(handleUploadHistoricalDataResponse)
  ]
]);

const onBridgeData = (dataType, dataString) => {
  try {
    const data = JSON.parse(dataString);
    callBridgeDataHandler(dataType)(data);
  } catch (error) {
    console.error('Error while parsing native request', error);
  }
};

const clearBluetoothData = async data => {
  await callNativeFunction('setBridgeData', DATA_TYPE.CLEAR_BT_DATA, data);
};

window.onBridgeData = onBridgeData;
window.bridgeDataResponse = receiveNativeResponse;

export default {
  getServicesStatus,
  setDiagnosisTimestamp,
  setPin,
  setServicesState,
  getNotification,
  clearBluetoothData
};
