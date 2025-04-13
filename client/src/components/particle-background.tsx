import React, { useCallback, useMemo } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";

interface ParticleBackgroundProps {
  className?: string;
  variant?: "hero" | "subtle" | "intense";
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ 
  className = "",
  variant = "hero" 
}) => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    console.log("Particles container loaded", container);
  }, []);

  // Different presets based on the variant
  const options = useMemo(() => {
    switch (variant) {
      case "hero":
        return {
          fullScreen: { enable: false },
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 120,
          particles: {
            number: {
              value: 80,
              density: {
                enable: true,
                value_area: 800
              }
            },
            color: {
              value: ["#5D3FD3", "#34D399", "#2A6BFF", "#FFFFFF"],
            },
            shape: {
              type: "circle",
            },
            opacity: {
              value: 0.5,
              random: true,
              anim: {
                enable: true,
                speed: 0.5,
                opacity_min: 0.1,
                sync: false
              }
            },
            size: {
              value: 3,
              random: true,
              anim: {
                enable: true,
                speed: 2,
                size_min: 0.1,
                sync: false
              }
            },
            line_linked: {
              enable: true,
              distance: 150,
              color: "#5D3FD3",
              opacity: 0.2,
              width: 1
            },
            move: {
              enable: true,
              speed: 1,
              direction: "none",
              random: true,
              straight: false,
              out_mode: "out",
              bounce: false,
              attract: {
                enable: true,
                rotateX: 600,
                rotateY: 1200
              }
            }
          },
          interactivity: {
            detect_on: "canvas",
            events: {
              onhover: {
                enable: true,
                mode: "grab"
              },
              onclick: {
                enable: true,
                mode: "push"
              },
              resize: true
            },
            modes: {
              grab: {
                distance: 140,
                line_linked: {
                  opacity: 0.5
                }
              },
              push: {
                particles_nb: 4
              }
            }
          },
          retina_detect: true
        };
      case "intense":
        return {
          fullScreen: { enable: false },
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 120,
          particles: {
            number: {
              value: 100,
              density: {
                enable: true,
                value_area: 800
              }
            },
            color: {
              value: ["#FF4D4D", "#FFFC4D", "#34D399", "#2A6BFF"],
            },
            shape: {
              type: ["circle", "triangle", "square"],
              stroke: {
                width: 1,
                color: "#FFFFFF"
              }
            },
            opacity: {
              value: 0.7,
              random: true,
              anim: {
                enable: true,
                speed: 1,
                opacity_min: 0.1,
                sync: false
              }
            },
            size: {
              value: 5,
              random: true,
              anim: {
                enable: true,
                speed: 4,
                size_min: 0.3,
                sync: false
              }
            },
            line_linked: {
              enable: true,
              distance: 150,
              color: "#FFFFFF",
              opacity: 0.3,
              width: 1
            },
            move: {
              enable: true,
              speed: 3,
              direction: "none",
              random: true,
              straight: false,
              out_mode: "bounce",
              bounce: true,
              attract: {
                enable: true,
                rotateX: 1200,
                rotateY: 1200
              }
            }
          },
          interactivity: {
            detect_on: "canvas",
            events: {
              onhover: {
                enable: true,
                mode: "repulse"
              },
              onclick: {
                enable: true,
                mode: "push"
              },
              resize: true
            },
            modes: {
              repulse: {
                distance: 100,
                duration: 0.4
              },
              push: {
                particles_nb: 4
              }
            }
          },
          retina_detect: true
        };
      case "subtle":
      default:
        return {
          fullScreen: { enable: false },
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 60,
          particles: {
            number: {
              value: 40,
              density: {
                enable: true,
                value_area: 1000
              }
            },
            color: {
              value: ["#5D3FD3", "#FFFFFF"],
            },
            shape: {
              type: "circle",
            },
            opacity: {
              value: 0.2,
              random: true,
              anim: {
                enable: true,
                speed: 0.3,
                opacity_min: 0.05,
                sync: false
              }
            },
            size: {
              value: 2,
              random: true,
              anim: {
                enable: true,
                speed: 1,
                size_min: 0.1,
                sync: false
              }
            },
            line_linked: {
              enable: true,
              distance: 150,
              color: "#5D3FD3",
              opacity: 0.1,
              width: 1
            },
            move: {
              enable: true,
              speed: 0.5,
              direction: "none",
              random: true,
              straight: false,
              out_mode: "out",
              bounce: false,
              attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200
              }
            }
          },
          interactivity: {
            detect_on: "canvas",
            events: {
              onhover: {
                enable: true,
                mode: "bubble"
              },
              resize: true
            },
            modes: {
              bubble: {
                distance: 150,
                size: 4,
                duration: 2,
                opacity: 0.4,
                speed: 3
              }
            }
          },
          retina_detect: true
        };
    }
  }, [variant]);

  return (
    <div className={`absolute inset-0 z-0 ${className}`}>
      <Particles
        id={`tsparticles-${variant}`}
        init={particlesInit}
        loaded={particlesLoaded}
        options={options}
        className="w-full h-full"
      />
    </div>
  );
};

export default ParticleBackground;