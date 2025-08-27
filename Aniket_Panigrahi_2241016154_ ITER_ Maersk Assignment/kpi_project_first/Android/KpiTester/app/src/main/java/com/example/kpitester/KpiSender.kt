package com.example.kpitester

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.Call
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import java.util.concurrent.TimeUnit

interface ApiService {
    @POST("/api/kpi")
    fun sendKpi(@Body sample: KpiSample): Call<Void>
}

class KpiSender(baseUrl: String, apiKey: String) {
    private val api: ApiService

    init {
        val logger = HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BASIC }
        val client = OkHttpClient.Builder()
            .addInterceptor(logger)
            .addInterceptor { chain ->
                val req = chain.request().newBuilder().addHeader("x-api-key", apiKey).build()
                chain.proceed(req)
            }
            .connectTimeout(15, TimeUnit.SECONDS)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        api = retrofit.create(ApiService::class.java)
    }

    fun send(sample: KpiSample, onSuccess: () -> Unit, onFail: (Throwable) -> Unit) {
        val call = api.sendKpi(sample)
        Thread {
            try {
                val resp = call.execute()
                if (resp.isSuccessful) onSuccess() else onFail(Exception("HTTP ${'$'}{resp.code()}"))
            } catch (e: Exception) {
                onFail(e)
            }
        }.start()
    }
}
