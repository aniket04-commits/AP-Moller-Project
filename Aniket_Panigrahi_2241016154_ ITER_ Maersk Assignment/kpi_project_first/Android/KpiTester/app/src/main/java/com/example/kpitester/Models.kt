package com.example.kpitester

data class KpiSample(
    val deviceId: String,
    val timestampUtc: String,
    val latitude: Double?,
    val longitude: Double?,
    val networkType: String?,
    val rssi: Int?,
    val rsrp: Double?,
    val rsrq: Double?,
    val sinr: Double?,
    val cellId: Long?,
    val pci: Int?,
    val tac: Int?
)
