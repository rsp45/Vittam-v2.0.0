import gradio as gr
import numpy as np
import pandas as pd
import yfinance as yf
import matplotlib.pyplot as plt
import seaborn as sns
import traceback
from functools import lru_cache
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_squared_error

# 1. Core Calculation Logic

def parkinson_rv(high, low, eps=1e-8):
    """Calculates Parkinson Realized Variance based on High/Low prices."""
    rv = (1 / (4 * np.log(2))) * (np.log(high / low) ** 2)
    return np.clip(rv, eps, None)

@lru_cache(maxsize=1)
def fetch_and_process_data():
    """
    Fetches data from Yahoo Finance, processes HAR features, 
    and merges with exogenous variables.
    """
    # --- A. Main Asset (USD/INR) ---
    print("Fetching USD/INR data...")
    usd_inr = yf.download("USDINR=X", start="2006-01-01", progress=False, auto_adjust=True)
    
    try:
        if isinstance(usd_inr.columns, pd.MultiIndex):
            usd_inr.columns = usd_inr.columns.get_level_values(0)
    except Exception:
        pass
    
    usd_inr = usd_inr[["High", "Low"]].dropna()

    # Calculate RV and HAR Terms
    usd_inr["rv"] = parkinson_rv(usd_inr["High"], usd_inr["Low"])
    usd_inr["log_rv"] = np.log(usd_inr["rv"])
    usd_inr["log_rv_d"] = usd_inr["log_rv"].shift(1)
    usd_inr["log_rv_w"] = usd_inr["log_rv"].rolling(5).mean().shift(1)
    usd_inr["log_rv_m"] = usd_inr["log_rv"].rolling(22).mean().shift(1)
    usd_inr["vov"] = usd_inr["rv"].rolling(5).std()

    # --- B. Exogenous Assets ---
    exo_tickers = {
        "DXY": "DX-Y.NYB", "BRENT": "BZ=F", "VIX": "^VIX", 
        "SP500": "^GSPC", "NIFTY": "^NSEI"
    }
    
    print("Fetching Exogenous variables...")
    exo_raw = yf.download(list(exo_tickers.values()), start="2006-01-01", progress=False, auto_adjust=True)
    
    exo_rv = {}
    for name, ticker in exo_tickers.items():
        if isinstance(exo_raw.columns, pd.MultiIndex):
            try:
                high = exo_raw["High"][ticker]
                low  = exo_raw["Low"][ticker]
            except KeyError:
                continue
        else:
            high = exo_raw["High"]
            low = exo_raw["Low"]
            
        exo_rv[name] = parkinson_rv(high, low)

    exo_rv = pd.DataFrame(exo_rv)
    
    # Calculate Log-Returns of RV (Volatility Shocks) + Lag them
    exo_rv = np.log(exo_rv).diff().shift(1)
    exo_rv.columns = [f"{c.lower()}_rv" for c in exo_rv.columns]
    
    # Align indices
    exo_rv = exo_rv.reindex(usd_inr.index)

    # --- C. Final Merge ---
    final_df = usd_inr[["log_rv", "log_rv_d", "log_rv_w", "log_rv_m", "vov"]]
    final_df = final_df.join(exo_rv, how="inner").replace([np.inf, -np.inf], np.nan).dropna()
    
    return final_df

def train_model(final_df):
    """Trains the Linear Regression model and returns detailed results."""
    split = int(len(final_df) * 0.8)
    train = final_df.iloc[:split]
    test = final_df.iloc[split:]

    X_train = train.drop(columns="log_rv")
    y_train = train["log_rv"]
    X_test = test.drop(columns="log_rv")
    y_test = test["log_rv"]

    model = LinearRegression()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    # Metrics
    r2 = r2_score(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    
    # Predict Next Day
    last_row = final_df.iloc[[-1]].drop(columns="log_rv")
    next_day_log_pred = model.predict(last_row)[0]
    next_day_rv_pred = np.exp(next_day_log_pred)
    
    return r2, rmse, y_test, y_pred, next_day_rv_pred

# 2. Plotting Functions

def plot_distribution(df):
    fig = plt.figure(figsize=(10, 5))
    sns.histplot(df['log_rv'], bins=50, kde=True, color='skyblue')
    plt.title('Distribution of Log Realized Volatility')
    plt.grid(True, alpha=0.3)
    return fig

def plot_timeseries(df):
    fig = plt.figure(figsize=(10, 5))
    plt.plot(df.index, df['log_rv'], label='Log RV', linewidth=0.5, color='navy')
    plt.title('Volatility Clustering over Time')
    plt.legend()
    plt.grid(True, alpha=0.3)
    return fig

def plot_har_components(df):
    fig = plt.figure(figsize=(10, 5))
    subset = df.iloc[-100:]
    plt.plot(subset.index, subset['log_rv_d'], label='Daily', alpha=0.6)
    plt.plot(subset.index, subset['log_rv_w'], label='Weekly', alpha=0.8, linewidth=1.5)
    plt.plot(subset.index, subset['log_rv_m'], label='Monthly', alpha=0.8, linewidth=1.5)
    plt.title('HAR Components (Last 100 Days)')
    plt.legend()
    plt.grid(True, alpha=0.3)
    return fig

def plot_actual_vs_predicted(y_test, y_pred):
    fig = plt.figure(figsize=(10, 5))
    limit = 100
    plt.plot(y_test.index[-limit:], y_test.values[-limit:], label='Actual', color='black', alpha=0.7)
    plt.plot(y_test.index[-limit:], y_pred[-limit:], label='Predicted', color='red', linestyle='--', alpha=0.8)
    plt.title(f'Actual vs Predicted Volatility (Last {limit} Days)')
    plt.legend()
    plt.grid(True, alpha=0.3)
    return fig

def plot_rolling_rmse(y_test, y_pred, window=60):
    errors = (y_test - y_pred) ** 2
    rolling_rmse = np.sqrt(errors.rolling(window=window).mean())
    
    fig = plt.figure(figsize=(10, 6))
    plt.plot(y_test.index, rolling_rmse, color='darkorange', linewidth=2)
    plt.title(f'Rolling RMSE (Model Stability - {window} Day Window)')
    plt.ylabel('Root Mean Squared Error')
    plt.xlabel('Date')
    
    avg_rmse = np.sqrt(errors.mean())
    plt.axhline(avg_rmse, color='grey', linestyle='--', label=f'Avg RMSE: {avg_rmse:.4f}')
    
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.fill_between(y_test.index, rolling_rmse, color='orange', alpha=0.1)
    return fig

# 3. Gradio Interface Logic

def generate_dashboard():
    try:
        # 1. Get Data
        df = fetch_and_process_data()
        
        # 2. Train Model
        r2, rmse, y_test, y_pred, next_day_pred = train_model(df)
        
        # 3. Generate Plots
        p_dist = plot_distribution(df)
        p_time = plot_timeseries(df)
        p_har = plot_har_components(df)
        p_act_pred = plot_actual_vs_predicted(y_test, y_pred)
        p_rolling = plot_rolling_rmse(y_test, y_pred)
        
        # 4. Text Summaries
        eda_summary = f"**Data Shape:** {df.shape} | **Date Range:** {df.index.min().date()} to {df.index.max().date()}"
        
        model_summary = f"""
        ### Forecast
        **Prediction for Next Trading Day:** {next_day_pred:.6f} (Realized Variance)
        
        ### Model Performance
        - **R-Squared:** {r2:.4f}
        - **Overall RMSE:** {rmse:.4f}
        """
        
        # 5. Prepare Dataset for Display
        display_df = df.reset_index().sort_values(by="Date", ascending=False)
        
        return p_dist, p_time, p_har, p_act_pred, p_rolling, eda_summary, model_summary, display_df
        
    except Exception as e:
        error_msg = f"**Error encountered during analysis:**\n```\n{str(e)}\n{traceback.format_exc()}\n```"
        empty_fig = plt.figure(figsize=(10, 5))
        plt.text(0.5, 0.5, 'Error Generating Plot', horizontalalignment='center', verticalalignment='center')
        plt.axis('off')
        
        return empty_fig, empty_fig, empty_fig, empty_fig, empty_fig, error_msg, "Model failed to train.", pd.DataFrame()
    
    model_summary = f"""
    ### Forecast
    **Prediction for Next Trading Day:** {next_day_pred:.6f} (Realized Variance)
    
    ### Model Performance
    - **R-Squared:** {r2:.4f}
    - **Overall RMSE:** {rmse:.4f}
    """
    
    # 5. Prepare Dataset for Display (Reset index and sort by newest)
    display_df = df.reset_index().sort_values(by="Date", ascending=False)
    
    return p_dist, p_time, p_har, p_act_pred, p_rolling, eda_summary, model_summary, display_df

# 4. Build App Layout

custom_theme = gr.themes.Soft(
    primary_hue="indigo",
    secondary_hue="violet",
    neutral_hue="slate",
    font=[gr.themes.GoogleFont("Inter"), "ui-sans-serif", "system-ui", "sans-serif"]
).set(
    button_primary_background_fill="*primary_600",
    button_primary_background_fill_hover="*primary_700",
    button_primary_text_color="white",
    block_title_text_weight="600",
    block_border_width="1px",
    block_shadow="*shadow_sm",
    block_background_fill="*neutral_50"
)

with gr.Blocks(title="Professional Volatility Dashboard", theme=custom_theme, css="""
    .gradio-container { max-width: 1200px !important; margin: auto; }
    .header-text { text-align: center; margin-bottom: 2rem; }
    .header-text h1 { color: var(--primary-700); font-weight: 800; font-size: 2.5rem; }
    .header-text p { color: var(--neutral-500); font-size: 1.1rem; }
""") as demo:
    
    with gr.Column(elem_classes="header-text"):
        gr.Markdown("# 📈 Vittam 1.0 Legacy Engine")
        gr.Markdown("Real-time analysis of USD/INR volatility with stability metrics, forecasts, and raw data inspection.")
    
    with gr.Row():
        run_btn = gr.Button("🚀 Run Complete Analysis", variant="primary", scale=1, size="lg")
        clear_btn = gr.Button("Reset", variant="secondary", scale=0, size="lg")
    
    with gr.Tabs():
        # TAB 1
        with gr.TabItem("📊 Market Overview"):
            with gr.Row():
                eda_text = gr.Markdown("Click **Run Complete Analysis** to fetch data and process features.", elem_classes="text-center")
            with gr.Row():
                p1 = gr.Plot(label="Volatility Distribution")
                p2 = gr.Plot(label="Time Series Clustering")
            with gr.Row():
                p3 = gr.Plot(label="HAR Components (Lags)")
        
        # TAB 2        
        with gr.TabItem("🧠 Model Stability & Forecast"):
            with gr.Row():
                model_text = gr.Markdown("Model not trained yet.")
            with gr.Row():
                p5 = gr.Plot(label="Model Stability (Rolling RMSE)") 
                p4 = gr.Plot(label="Actual vs Predicted (Zoomed)")
        
        # TAB 3
        with gr.TabItem("🗄️ Final Dataset"):
            gr.Markdown("### Processed Model Data (Newest First)")
            dataset_table = gr.Dataframe(
                label="USD/INR & Exogenous Variables", 
                interactive=False, 
                wrap=True
            )

    run_btn.click(
        fn=generate_dashboard,
        inputs=[],
        outputs=[p1, p2, p3, p4, p5, eda_text, model_text, dataset_table]
    )
    
    clear_btn.click(
        fn=lambda: [None]*5 + ["Ready.", "Ready.", pd.DataFrame()],
        inputs=[],
        outputs=[p1, p2, p3, p4, p5, eda_text, model_text, dataset_table]
    )

if __name__ == "__main__":
    demo.launch()