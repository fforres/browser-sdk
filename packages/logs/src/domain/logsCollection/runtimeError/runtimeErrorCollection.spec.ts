import { ErrorSource, Observable, resetExperimentalFeatures, updateExperimentalFeatures } from '@datadog/browser-core'
import type { RawError, RelativeTime, TimeStamp } from '@datadog/browser-core'
import type { LogsConfiguration } from '../../configuration'
import { createSender } from '../../sender'
import { StatusType } from '../../logger'
import { startRuntimeErrorCollection } from './runtimeErrorCollection'

describe('runtime error collection', () => {
  let rawErrorObservable: Observable<RawError>
  let sendLogSpy: jasmine.Spy
  let stopRuntimeErrorCollection: () => void
  beforeEach(() => {
    rawErrorObservable = new Observable<RawError>()
    sendLogSpy = jasmine.createSpy('sendLogSpy')
    ;({ stop: stopRuntimeErrorCollection } = startRuntimeErrorCollection(
      {} as LogsConfiguration,
      createSender(sendLogSpy),
      rawErrorObservable
    ))
  })

  afterEach(() => {
    stopRuntimeErrorCollection()
    resetExperimentalFeatures()
  })

  it('should send runtime errors', () => {
    rawErrorObservable.notify({
      message: 'error!',
      source: ErrorSource.SOURCE,
      startClocks: { relative: 1234 as RelativeTime, timeStamp: 123456789 as TimeStamp },
      type: 'Error',
    })

    expect(sendLogSpy).toHaveBeenCalled()
    expect(sendLogSpy.calls.first().args).toEqual([
      {
        date: 123456789 as TimeStamp,
        error: { origin: ErrorSource.SOURCE, kind: 'Error', stack: undefined },
        message: 'error!',
        status: StatusType.error,
      },
    ])
  })

  it('should send runtime errors with "source" origin when ff forward-logs is enabled', (done) => {
    updateExperimentalFeatures(['forward-logs'])

    rawErrorObservable.notify({
      message: 'error!',
      source: ErrorSource.SOURCE,
      startClocks: { relative: 1234 as RelativeTime, timeStamp: 123456789 as TimeStamp },
      type: 'Error',
    })

    expect(sendLogSpy.calls.mostRecent().args[0].origin).toEqual(ErrorSource.SOURCE)
    done()
  })
})
