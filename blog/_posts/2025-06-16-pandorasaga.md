---
layout: post
title:  "Pandora Saga on Linux"
date:   2025-06-16 12:30:00 -0700
categories: gaming Linux PandoraSaga 
---

### all this to play an old game
#### tl;dr QEMU has flags to 3D accelerate an SDL window and hide that it's a vm.

I spent a solid 6 hours attempting to get around VM detection in a Pandora Saga private server client to play on Linux.  

vm detection makes sense, given the game has a history of multi-boxing, but personally, I don't believe multi-boxing is a harmful practice in this game.  
I know how it *can* be harmful if automation isn't prevented, resulting in these two choices:  
1. **emulated inputs are blocked**
2. **running processes are monitored**  

there are robust methods to stop automation:

- checking environment signatures signaled by inconsistencies in network activity
- monitoring the whole system from a **kernel** level
- peripheral input and calls to graphics API or Windows API functions being heavily monitored.  

   
for this private server, the anti-cheat is simple. from my testing, it checks for all input at a low level, still **userland level**, instead of **kernel**, using keyboard hooks.  
my guess is `SetWindowsHookEx` to get all inputs as they come through RDP.  
inputs are sent through the protocol to the window as virtual input.  


the Pandora Saga launcher will open in a virtual machine, then crash with the error popup: 

`"virtual machine detected!"`

virtual machines are easily detected by the guest operating system. QEMU has a few flags to hide this:  

```xml      
<kvm><hidden state="on"/></kvm>
<cpu mode="host" check="none">
<model fallback="allow"/>
<feature policy="disable" name="hypervisor"/>
</cpu>
```

task manager will no longer show `"virtual machine: yes"` in detailed performance view. I use an Intel ARC A770 so my GPU driver does not trigger anything like error 43 on NVIDIA cards.

with that fixed, the next hurdle is getting keyboard input to the game. I could use my mouse to navigate the game and click hotbars over RDP. this project's goal is to figure out vm options and eliminate RDP so that won't do. 

my testing resulted in these findings:

1. mouse input **always** worked regardless of RDP or virtual machine
2. Moonlight RDP into a virtual machine blocked keyboard input in game
3. passing a keyboard to a Windows vm accessed over Moonlight gave me keyboard input
4. running the game in a basic QXL vm with no graphics drivers allowed keyboard input
5. OpenGL + Spice 3d acceleration config flags exist
6. virt-manager supports M-Dev SR-IOV GPU partitions
7. my install of QEMU had SDL window support but no Spice, only spice-app


6 didn't work out, despite Intel consumer cards supporting SR-IOV.  

SR-IOV functionality in Linux is undocumented and difficult to troubleshoot on ARC cards. older iGPUs support it for some reason. 

if you're in a virtual machine, input sending is different than RDP, so I shifted to a 3D accelerated QEMU configuration.   
I chose SDL, though I think there's a Spice-app + keyboard Virtio `ctrl+ctrl` trigger setup I can fenagle.  


the Virtio guest tools have a driver for Virtio graphics from QEMU to have 3D acceleration if you're not passing a physical device or using an M-Dev partitioned GPU.  

after installing, DXDiag now shows `"Red Hat Virtio DOD D3D Driver"`


the OpenGL 3D acceleration uses the hosts OpenGL by piping calls from QEMU to

`/dev/dri/renderd128` 
 
on the host.  

you can't play Cyberpunk 2077, but it works fine for old games. Pandora Saga is mostly CPU dependent even with Vulkan translation, which this config can't use anyway. you *could* try the Venus protocol to translate OpenGL calls to Vulkan. I had no luck with it. Directx 9 is enough for my purposes.  
 
now, keyboard input is sent directly from the virtual machine to the game, eliminating RDP emulated inputs.

this is the final QEMU command:  

```bash
#!/bin/bash

QEMU_BIN="/usr/bin/qemu-system-x86_64"
VM_NAME="win10"
VM_UUID="<your own uuid>"
VM_MEMORY="8G"
VM_CPUS="4,cores=4"
VM_QCOW2="/var/lib/libvirt/images/win10.qcow2"
$QEMU_BIN \
-name "$VM_NAME" \
-uuid "$VM_UUID" \
-enable-kvm \
-m "$VM_MEMORY" \
-smp "$VM_CPUS" \
-cpu host,hypervisor=off \
-smbios type=1,manufacturer=RedHat,product=KVM,version=9.2.0,uuid="$VM_UUID" \
-M pc-q35-9.2 \
-rtc base=localtime,driftfix=slew \
-device ich9-Intel-hda \
-device hda-duplex \
-device intel-hda \
-device hda-codec-all \
-device virtio-balloon-pci,bus=pcie.0,addr=0x4 \
-device virtio-serial-pci,bus=pcie.0,addr=0x3 \
-device qemu-xhci,bus=pcie.0,addr=0x2 \
-device usb-tablet \
-device usb-mouse \
-device usb-kbd \
-device ich9-ahci,id=sata0,bus=pcie.0,addr=0x7 \
-drive file="$VM_QCOW2",if=none,format=qcow2,discard=unmap,id=disk0 \
-device virtio-blk-pci,drive=disk0,bus=pcie.0,addr=0x5 \
-netdev user,id=vnet0 \
-device e1000e,netdev=vnet0,mac=52:54:00:17:a4:dd,bus=pcie.0,addr=0x6 \
-serial pty \
-monitor stdio \
-display sdl,gl=on \
-nodefaults
``` 

happy PK-ing.

-- mino