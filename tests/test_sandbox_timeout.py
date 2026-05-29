import os
import subprocess
import sys
import tempfile
import textwrap


def test_infinite_loop_timeout() -> None:
    # Get the absolute root directory of this project
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    # Write a small script to a temporary file that runs the benchmark model
    # We protect the benchmark call with if __name__ == '__main__' to satisfy Windows multiprocessing
    script_content = textwrap.dedent(f"""
        import sys
        
        # Inject the correct project root directory
        sys.path.insert(0, r"{root_dir}")
            
        from backend.app.services.generated_model_runner import benchmark_generated_model
        
        source_code = '''
        class GeneratedVolatilityModel:
            def fit(self, values: list[float]) -> None:
                # Infinite loop to test the 2-second timeout
                x = 0
                while True:
                    x += 1
            def predict(self, horizon: int) -> list[float]:
                return [0.1 for _ in range(horizon)]
        '''
        
        if __name__ == '__main__':
            # Execute the sandbox benchmark
            result = benchmark_generated_model(source_code, [0.01 for _ in range(40)])
            
            # Verify result states
            if result.passed is False and any("timed out" in issue for issue in result.issues):
                print("SANDBOX_TIMEOUT_PASSED")
                sys.exit(0)
            else:
                print(f"FAILED: {{result.issues}}")
                sys.exit(1)
    """)
    
    # Create the temporary script file
    temp_fd, temp_path = tempfile.mkstemp(suffix=".py")
    try:
        with os.fdopen(temp_fd, "w") as f:
            f.write(script_content)
        
        # Execute python directly in a clean environment subprocess
        res = subprocess.run(
            [sys.executable, temp_path],
            capture_output=True,
            text=True,
            timeout=10,
        )
        
        assert "SANDBOX_TIMEOUT_PASSED" in res.stdout
    finally:
        try:
            os.unlink(temp_path)
        except Exception:
            pass
