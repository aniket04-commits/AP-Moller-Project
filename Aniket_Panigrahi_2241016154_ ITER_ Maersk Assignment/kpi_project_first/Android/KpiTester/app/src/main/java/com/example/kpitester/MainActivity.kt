package com.example.kpitester

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.Manifest
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import android.widget.Button
import android.widget.TextView
import android.location.Location
import com.github.mikephil.charting.charts.LineChart
import com.github.mikephil.charting.data.LineDataSet
import com.github.mikephil.charting.data.Entry
import com.github.mikephil.charting.data.LineData
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices

class MainActivity : AppCompatActivity() {
    private lateinit var provider: TelemetryProvider
    private lateinit var sender: KpiSender
    private lateinit var fusedLocationClient: FusedLocationProviderClient
    private val samples = mutableListOf<Double>()
    private lateinit var chart: LineChart

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        provider = TelemetryProvider(this)
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)
        sender = KpiSender("http://10.0.2.2:4000", "SUPERSECRETKEY")

        val btnSample = findViewById<Button>(R.id.btnSample)
        val status = findViewById<TextView>(R.id.tvStatus)
        chart = findViewById(R.id.lineChart)

        btnSample.setOnClickListener {
            getLastLocation { loc ->
                val s = provider.sampleKpi(loc)
                status.text = "Sending sample: ${'$'}{s.rsrp}"
                sender.send(s, {
                    runOnUiThread { status.text = "Sent OK: ${'$'}{s.timestampUtc}" }
                    addPoint(s.rsrp ?: 0.0)
                }, { err ->
                    runOnUiThread { status.text = "Send failed: ${'$'}{err.message}" }
                })
            }
        }
    }

    private fun addPoint(valRsrp: Double) {
        samples.add(valRsrp)
        val entries = samples.mapIndexed { idx, v -> Entry(idx.toFloat(), v.toFloat()) }
        val ds = LineDataSet(entries, "RSRP")
        val data = LineData(ds)
        runOnUiThread { chart.data = data; chart.invalidate() }
    }

    private fun getLastLocation(callback: (Location?) -> Unit) {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION), 1001)
            callback(null)
            return
        }
        fusedLocationClient.lastLocation.addOnSuccessListener { loc -> callback(loc) }
    }
}
