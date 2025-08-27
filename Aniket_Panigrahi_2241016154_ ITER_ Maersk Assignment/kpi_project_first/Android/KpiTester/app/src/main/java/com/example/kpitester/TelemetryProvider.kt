package com.example.kpitester

import android.content.Context
import android.telephony.TelephonyManager
import android.location.Location
import java.time.Instant
import java.time.format.DateTimeFormatter
import kotlin.random.Random

class TelemetryProvider(private val context: Context) {

    private val tm by lazy { context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager }

    fun getDeviceId(): String {
        return try {
            tm.deviceId ?: android.provider.Settings.Secure.getString(context.contentResolver, android.provider.Settings.Secure.ANDROID_ID)
        } catch (e: Exception) {
            android.provider.Settings.Secure.getString(context.contentResolver, android.provider.Settings.Secure.ANDROID_ID)
        }
    }

    fun nowUtcIso(): String {
        return DateTimeFormatter.ISO_INSTANT.format(Instant.now())
    }

    fun sampleKpi(location: Location?): KpiSample {
        val deviceId = getDeviceId()
        val lat = location?.latitude
        val lon = location?.longitude

        val rsrp = -100 + Random.nextDouble(-5.0, 10.0)
        val rsrq = -10 + Random.nextDouble(-2.0, 2.0)
        val sinr = 5 + Random.nextDouble(-5.0, 10.0)
        val cellId = Random.nextLong(1000, 9999)
        val pci = Random.nextInt(0, 503)
        val tac = Random.nextInt(1000, 9999)

        return KpiSample(
            deviceId = deviceId,
            timestampUtc = nowUtcIso(),
            latitude = lat,
            longitude = lon,
            networkType = "LTE",
            rssi = null,
            rsrp = rsrp,
            rsrq = rsrq,
            sinr = sinr,
            cellId = cellId,
            pci = pci,
            tac = tac
        )
    }
}
