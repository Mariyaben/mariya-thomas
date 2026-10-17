plugins { id("com.android.application") }
android {
    namespace = "love.betweenus"
    compileSdk = 35
    defaultConfig { applicationId = "love.betweenus"; minSdk = 28; targetSdk = 35; versionCode = 3; versionName = "1.2" }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
}
