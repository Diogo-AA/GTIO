FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ENV PUERTO_API=8080

WORKDIR /src
COPY [".", "."]

WORKDIR /src
RUN dotnet restore "./Backend.csproj"
RUN dotnet build "./Backend.csproj" -c Release -o /app/build

RUN dotnet publish "./Backend.csproj" -c Release -o /app/publish -r linux-musl-x64

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS run
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT [ "dotnet", "Backend.dll" ]

EXPOSE $PUERTO_API